# MerMer-framework
MerMer Framework for Front End and Back End

## Install
```shell
npm i -g mermer
```

## Initial New Project
```shell
mermer init /path/to/your/new/project
```

### edit package
```shell
vi /path/to/your/new/project/package.json
```

### edit config
```shell
cp /path/to/your/new/project/sample.config.toml /path/to/your/new/project/config.toml
vi /path/to/your/new/project/config.toml
```
```toml
[api]
pathname = [
  "get | /,/version | Static.Utils.readPackageInfo"
]

# [method] | [path] | [execute function]
```

## Run Project
```
cd /path/to/your/new/project/
bin/main.js
```
