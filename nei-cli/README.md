# nei-cli

Pull json data from NEI, and auto create .json file

### 使用

1. `npm install phantomjs-prebuilt -g`  
2. `npm install nei-cli -g`  
3. 在工程内创建.neirc，为了方便使用，尽量放在和.nekrc，moky.config.js等配置文件相同目录  
4. `nei build -i [id]`，通过id拉取json数据  
5. `nei build -t [tag]`, 通过标签拉取json数据

### FAQ

### Q: 为什么需要全局安装 phantomjs-prebuilt

A: 根本原因在于这个问题 **Why is PhantomJS not written as Node.js module?**

官方答复：  

A: The short answer: “No one can serve two masters.”

A longer explanation is as follows.

As of now, it is technically very challenging to do so.

Every Node.js module is essentially “a slave” to the core of Node.js, i.e. “the master”. In its current state, PhantomJS (and its included WebKit) needs to have the full control (in a synchronous matter) over everything: event loop, network stack, and JavaScript execution.

If the intention is just about using PhantomJS right from a script running within Node.js, such a “loose binding” can be achieved by launching a PhantomJS process and interact with it.