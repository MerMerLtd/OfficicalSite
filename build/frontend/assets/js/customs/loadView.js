//check for Navigation Timing API support
if (window.performance) {
    console.info("window.performance works fine on this browser");
}
if (performance.navigation.type === 1) {
    console.info("This page is reloaded");

} else {
    console.info("This page is not reloaded");
}

// polyfill for Element.closest from MDN
if (!Element.prototype.matches)
    Element.prototype.matches = Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;

if (!Element.prototype.closest)
    Element.prototype.closest = function (s) {
        var el = this;
        if (!document.documentElement.contains(el)) return null;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement;
        } while (el !== null);
        return null;
    };

// 同一 element 監聽 || 不監聽多個event
const addMultiListener = (element, events, func) => {
    events.split(" ").forEach(event => element.addEventListener(event, func, false));
}

const removeMultiListener = (element, events, func) => {
    events.split(" ").forEach(event => element.removeEventListener(event, func, false));
}

// enableBtn || disableBtn
const disableBtn = btnEl => {
    if (btnEl.classList.contains("disable")) return;
    btnEl.classList.add("disable");
}

const enableBtn = btnEl => {
    if (!btnEl.classList.contains("disable")) return;
    btnEl.classList.remove("disable");
}

// hidden Child Elements
const hiddenChildEls = parentEl => {
    Array.from(parentEl.children).forEach(el => el.classList.add("u-hidden"));
}

const unHiddenChildEls = parentEl => {
    Array.from(parentEl.children).forEach(el => el.classList.remove("u-hidden"));
}

// hidden Element
const unhiddenElement = (element, delay) => {
    element.classList.remove("u-hidden");
    // setTimeout(() => {
    // }, delay);
}
const hiddenElement = (element, delay) => {
    // console.log(element);
    element.classList.add("u-hidden");
    // setTimeout(() => {
    // }, delay);
}

const onNavItemClick = (hash) => {
    window.history.pushState(
        hash,
        window.location.href,
    );
    window.location.hash = hash;
}

// https://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/
const to = promise => {
    return promise.then(data => {
            return [null, data];
        })
        .catch(err => [err, null]);
}

// =============================================================
// base
// XHR
const maxConnection = Infinity;
const maxRetry = 3;
let connection = 0;
let queue = [];


const closeConnection = () => {
    connection--;

    if (queue.length > 0 && connection < maxConnection) {
        let next = queue.pop();
        if (typeof next === "function") {
            next();
        }
    }

    return true;
}

const makeRequest = opts => {
    // 工作排程 && 重傳
    if (connection >= maxConnection) {
        queue.push(opts); // ??
    } else {
        connection++;
        const xhr = new XMLHttpRequest();
        // xhr.responseType = "arraybuffer";
        if (opts.responseType === "arraybuffer") {
            xhr.responseType = "arraybuffer";
        }
        return new Promise((resolve, reject) => {
            xhr.onreadystatechange = () => {
                // only run if the request is complete
                if (xhr.readyState !== 4) return;
                if (xhr.status >= 200 && xhr.status < 300) {
                    // If successful
                    closeConnection();
                    opts.responseType === "arraybuffer" ?
                        resolve(new Uint8Array(xhr.response)) :
                        resolve(JSON.parse(xhr.responseText));
                } else {
                    // If false  
                    closeConnection();
                    reject(xhr.response);
                }
            }
            // Setup HTTP request
            xhr.open(opts.method || "GET", opts.url, true);
            if (opts.headers) {
                Object.keys(opts.headers).forEach(key => xhr.setRequestHeader(key, opts.headers[key]));
            }
            // Send the request
            if (opts.contentType === 'application/json') {
                xhr.setRequestHeader('content-type', 'application/json');
                xhr.send(JSON.stringify(opts.payload));
            } else {
                xhr.send(opts.payload);
            }
        });
    }
}

// https://github.com/Luphia/TexType/blob/master/index.js
const DataType = function () {}

const regExp = {
    email: /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/,
    password8: /[\x21-\x7e]{8,}$/,
    digit: /^-?\d+\.?\d*$/, //  /^\d+$/;
    hasDigit: /\d{6}/,
    internalIP: /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/,
    URL: /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/,
    // URL: new RegExp('http(s)?://([\\w-]+\\.)+[\\w-]+(/[\\w- ./?%&=]*)?'),
}

DataType.prototype = {
    is: (data, type) => {
        if (regExp[type] && typeof (regExp[type].test) === "function") {
            return regExp[type].test(data);
        }
    },
    isEmail: data => regExp.email.test(data),
    isPassword8: data => regExp.password8.test(data),
    isURL: data => regExp.URL.test(data),
    isDigit: data => regExp.digit.test(data),
}

const dataType = new DataType();

// render Loader && remove Loader
const renderLoader = parentEl => {
    // console.log(parentEl)  // elements.downloadCard
    hiddenChildEls(parentEl);
    const markup = `
        <div class="lds-spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    `;
    parentEl.insertAdjacentHTML("afterbegin", markup);
}

const removeLoader = parentEl => {
    elements = {
        ...elements,
        loader: document.querySelector(".lds-spinner"),
    }
    elements.loader.remove();
    unHiddenChildEls(parentEl);
}

const formatTime = time => {
    const min = Math.trunc(time / 1000 / 60).toString().length === 2 ?
        `${Math.trunc(time / 1000 / 60)}` :
        `0${Math.trunc(time / 1000 / 60)}`;
    const sec = ((time / 1000) % 60).toString().length === 2 ?
        `${(time / 1000) % 60}` :
        `0${(time / 1000) % 60}`;
    return [min, sec];
}

const countdown = (el, time) => {
    el.classList.add("disable");
    let timerTime = time * 60 * 1000;
    const interval = () => {
        let min, sec;
        if (timerTime === 0) {
            clearInterval(intervalId);
            el.classList.remove("disable")
            el.innerText = `Lets Go`;
            return timerTime;
        }
        timerTime -= 1000;
        [min, sec] = formatTime(timerTime);
        el.innerText = `${min}:${sec}`;
        return timerTime;
    }

    intervalId = setInterval(interval, 1000, timerTime);
}

const elements = {
    btnContactUs: document.querySelector(".btn-contactus"),
    inputFristName: document.querySelectorAll("input[name=name]")[0],
    inputLastName: document.querySelectorAll("input[name=name]")[1],
    inputEmail: document.querySelector("input[type=email]"),
    inputMessage: document.querySelector("textarea[name=message]"),
    inputCheckbox: document.querySelector("input[type=checkbox]"),
};
const contactUs = evt => {
    evt.preventDefault();
    if (!elements.inputCheckbox.checked) return;

    const opts = {
        contentType: 'application/json',
        method: "POST",
        // url: ``,
        payload: {
            firstName: elements.inputFristName.value,
            lastName: elements.inputLastName.value,
            email: elements.inputEmail.value,
            message: elements.inputMessage.value,
        },
    }

    let err, data;
    [err, data] = await to(makeRequest(opts));
    if (err) {
        console.log(err)
        // throw new Error(err)
    }
    if (data) {
        console.log(data);
        return;
    }
}

elements.inputCheckbox.addEventListener("change", () => {
    if (!elements.inputCheckbox.checked) elements.btnContactUs.classList.add("disabled");
    if (!!elements.inputCheckbox.checked) elements.btnContactUs.classList.remove("disabled");
}, false);
elements.btnContactUs.addEventListener("click", evt => contactUs(evt), false);