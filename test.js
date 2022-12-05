
import {
    isMainThread,
    Worker,
    parentPort,
    threadId,
  } from 'worker_threads';
  
    if (isMainThread) {  
      const worker = new Worker(__filename);  
      worker.on('message', (message) => {  
        console.log(message);
      });  
      worker.postMessage('Hello, world!');  
    } else {  
      // 做点耗时的事情  
      parentPort.once('message', (message) => { 
        console.log(message)
        parentPort.postMessage('Hello, parent!');  
      });  

    //   parentPort.postMessage('Hello, parent!');  
    }  
