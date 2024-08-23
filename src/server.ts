import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { FORKR_STATE } from './state';


function validateForkSlug(forkSlug: string){
  if (forkSlug.length < 3){
    return 'Fork slug must be at least 3 characters long';
  }
  if (forkSlug.length > 30){
    return 'Fork slug must be at most 30 characters long';
  }
  if (!forkSlug.match(/^[a-zA-Z0-9_]+$/)){
    return 'Fork slug must be alphanumeric';
  }

}

async function startAPIServer(port: number = 1449): Promise<any>{
  const app = express();
  app.use(cors({origin: '*'}));
  app.use(bodyParser.json());
  app.get('/status', (req, res) => {
    res.json({
      forks: FORKR_STATE.forks,
      currentFork: FORKR_STATE.currentFork,
      isBusy: FORKR_STATE.isBusy,
      rpcIsDisabled: FORKR_STATE.rpcIsDisabled,
      rpcIsRunning: FORKR_STATE.rpcIsRunning,
    });
  });
  app.use((req, res, next) => {
    if(FORKR_STATE.isBusy){
      res.status(503).json({error: 'Server is busy'});
    }else{
      next();
    }
  })
  app.get('/createfork/:newForkSlug', (req, res) => {
    const newForkSlug = (req.params.newForkSlug||"") as string;
    const validationError = validateForkSlug(newForkSlug);
    const shouldActivate = (req.query.activate === 'true' || req.query.activate === '1');
    if(validationError){
      res.status(400).json({error: validationError});
      return;
    }
    let source = (req.query.source||"") as string;
    if(source === ""){
      source = FORKR_STATE.currentFork
    }
    if(validateForkSlug(source)){
      res.status(400).json({error: "Invalid source fork slug"});
      return;
    }
    if(!FORKR_STATE.forks.includes(source)){
      res.status(400).json({error: "Source '"+source+"' fork not found"});
      return;
    }else{
      if(FORKR_STATE.isBusy){
        res.status(503).json({error: 'Server is busy'});
        return;
      }
      FORKR_STATE.createFork(source, newForkSlug, shouldActivate);
    }
    res.json(FORKR_STATE.forks);
  });
  app.get('/activatefork/:forkSlug', (req, res) => {
    const forkSlug = (req.params.forkSlug||"") as string;
    if(validateForkSlug(forkSlug)){
      res.status(400).json({error: "Invalid fork slug"});
      return;
    }
    if(!FORKR_STATE.forks.includes(forkSlug)){
      res.status(400).json({error: "Fork '"+forkSlug+"' not found"});
      return;
    }
    if(FORKR_STATE.isBusy){
      res.status(503).json({error: 'Server is busy'});
      return;
    }
    FORKR_STATE.activateFork(forkSlug);
    res.json(FORKR_STATE.forks);
  });
  app.get('/rpcproxy/disable', (req, res) => {
    FORKR_STATE.rpcIsDisabled = true;
    res.json({rpcIsDisabled: FORKR_STATE.rpcIsDisabled});
  });
  app.get('/rpcproxy/enable', (req, res) => {
    FORKR_STATE.rpcIsDisabled = false;
    res.json({rpcIsDisabled: FORKR_STATE.rpcIsDisabled});
  });

  return app;

}

export {
  startAPIServer,
}