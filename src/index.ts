import os from "os";
import cluster from "cluster";
import express from "express";

console.log(os.cpus().length);

if (cluster.isPrimary) {
  // spin off my other nodejs processes
  console.log(`Primary ${process.pid} started`);

  for (let i = 0; i < 3; i += 1) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`woker ${worker.process.pid} stopped`);
    console.log(`Forking a new instance`);
    cluster.fork();
  });
} else {
  // actual code which will run in all node processes
  console.log(
    `Worker with id ${process.pid} and id ${cluster?.worker?.id} started`
  );

  const app = express();

  app.get("/", (req, res) => {
    if (cluster?.worker?.id === 2) {
      //   let i = 1;
      //   while (i < 100000000000) {
      //     i += 1;
      //   }
      const loadStartTime = Date.now();
      const loadDuration = 10000; // 10 seconds

      while (Date.now() - loadStartTime < loadDuration) {
        // Busy-wait for 10 seconds
        continue;
      }

      console.log(`Worker ${process.pid} finished simulating load`);
    }
    return res.json({ msg: `Handled by process ${process.pid}` });
  });

  app.listen(8080, () => {
    console.log(`process ${process.pid} listening on port 8080`);
  });
}
