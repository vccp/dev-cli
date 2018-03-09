# vccp-cli
This is a global npm module to help you to easily install/setup boilerplates.  
It's universal and overtime more and more boilerplates can be easily added to the configuration file. Please leave a comment on the gist to add a boilerplate.  

Available boilerplates are constantly updated on the following gist:  
[boilerplate list](https://github.com/vccp/vccp-cli-config/blob/master/vccp-cli-config.json)   

Here are a few boilerplates that can be used with this tool:
- componentjs-boilerplate
- babel-seed

 ## Installation  
 ```cmd
npm install -g https://github.com/vccp/vccp-cli.git
```  

## Usage  
To install a boilplate use the `init` command followed by the key for the boilerplate (check the boilerplates object in the config file listed above).  

### Componentjs Example
```
vccp init componentjs
```

### Babel Example
```
vccp init babel
```

