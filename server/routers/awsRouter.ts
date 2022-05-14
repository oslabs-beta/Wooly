import express, { Response, Request, NextFunction } from 'express';
import lambdaController from '../controllers/aws/lambdaController';
import credController from '../controllers/aws/credController';
import cwController from '../controllers/aws/cloudwatchController';
import costController from '../controllers/aws/costController';
import logController from '../controllers/aws/logController';
import stepController from '../controllers/aws/stepFuncs/stepController';
import cookieController from '../controllers/cookieController';
import analysisController from '../controllers/aws/analysisController';
// import * as types from '../types';

const router = express.Router();

/* Lambda Function Names and Config Settings */
router.post(
  '/lambdaNames',
  cookieController.getCookieCredentials,
  credController.getCreds, // credentials go into res.locals.credentials
  lambdaController.getFunctions, // function details go into res.locals.lambdaFunctions
  (req: express.Request, res: express.Response) => {
    // console.log('SHOULD SHOW COOKIES HERE:', req.cookies)
    res.status(200).json(res.locals.funcNames);
  }
);

router.post(
  '/lambda',
  cookieController.getCookieCredentials,
  credController.getCreds, // credentials go into res.locals.credentials
  lambdaController.getFunctions, // function details go into res.locals.lambdaFunctions
  (req: express.Request, res: express.Response) => {
    res.status(200).json(res.locals.lambdaFunctions);
  }
);

/* Cloudwatch Metrics */
router.post(
  '/metricsTotalFuncs/:metric/:period/:stat',
  cookieController.getCookieCredentials,
  credController.getCreds,
  cwController.getMetricsTotalLambda,
  (req: Request, res: Response) => {
    res.status(200).json(res.locals.data);
  }
);

router.post(
  '/metricsEachFunc/:metric/:period/:stat',
  cookieController.getCookieCredentials,
  credController.getCreds,
  lambdaController.getFunctions,
  cwController.getMetricsEachLambda,
  (req: Request, res: Response) => {
    res.status(200).json(res.locals[req.params.metric]);
  }
);

router.post(
  '/rankFuncsByMetric/:metric/:period/:stat',
  cookieController.getCookieCredentials,
  credController.getCreds,
  lambdaController.getFunctions,
  cwController.rankFuncsByMetric,
  (req: Request, res: Response) => {
    res.status(200).json(res.locals.functionRankings);
  }
);

/* Lambda Costs */
router.post(
  '/costEachFunction/:period',
  cookieController.getCookieCredentials, // user data goes into res.locals.userData
  credController.getCreds,
  lambdaController.getFunctions, // res.locals.funcNames & res.locals.lambdaFunctions
  (req: Request, res: Response, next: NextFunction) => {
    req.params.metric = 'Invocations';
    req.params.stat = 'Sum';
    next();
  },
  cwController.getMetricsEachLambda,
  (req: Request, res: Response, next: NextFunction) => {
    req.params.metric = 'Duration';
    req.params.stat = 'Sum';
    next();
  },
  cwController.getMetricsEachLambda,
  costController.calcCostEachLambda,
  (req: Request, res: Response) => {
    res.status(200).json(res.locals.costData);
  }
);

/* All logs */
router.post(
  '/lambdaLogs/:function/:period',
  cookieController.getCookieCredentials,
  credController.getCreds,
  logController.getLambdaLogsByFunc,
  analysisController.calcMetrics,
  (req: Request, res: Response) => {
    res.status(200).json(res.locals.logs);
  }
);

/* Log Errors */
router.post(
  '/lambdaErrorLogsByFunc/:function/:period',
  cookieController.getCookieCredentials,
  credController.getCreds,
  logController.getLambdaErrorsByFunc,
  (req: Request, res: Response) => {
    res.status(200).json(res.locals.logs);
  }
);

router.post(
  '/lambdaErrorLogsEachFunc/:period',
  cookieController.getCookieCredentials,
  credController.getCreds,
  lambdaController.getFunctions,
  logController.getLambdaErrorsEachFunc,
  (req: Request, res: Response) => {
    res.status(200).json(res.locals.logs);
  }
);

/* Log Metrics */
router.post(
  '/lambdaLogMetricsByFunc/:function/:period',
  cookieController.getCookieCredentials,
  credController.getCreds,
  logController.getLambdaLogsByFunc,
  analysisController.calcMetrics,
  (req: Request, res: Response) => {
    res.status(200).json(res.locals.data);
  }
);

router.post(
  '/lambdaLogMetricsEachFunc/:period',
  cookieController.getCookieCredentials,
  credController.getCreds,
  logController.getLambdaLogsByFunc,
  analysisController.calcMetrics,
  (req: Request, res: Response) => {
    res.status(200).json(res.locals.data);
  }
);

router.post(
  '/lambdaLogMetricsTotalFunc/:function/:period',
  cookieController.getCookieCredentials,
  credController.getCreds,
  logController.getLambdaLogsByFunc,
  analysisController.calcMetrics,
  (req: Request, res: Response) => {
    res.status(200).json(res.locals.data);
  }
);

/* Log Memory Usage */
router.post(
  '/memoryUsageEachLambda/:period',
  cookieController.getCookieCredentials,
  credController.getCreds,
  lambdaController.getFunctions,
  logController.getLambdaUsageEachFunc,
  analysisController.calcMemoryUsage,
  (req: Request, res: Response) => {
    res.status(200).json(res.locals.data);
  }
);

router.post(
  '/memoryUsageTotalLambda/:period',
  cookieController.getCookieCredentials,
  credController.getCreds,
  lambdaController.getFunctions,
  logController.getLambdaUsageEachFunc,
  analysisController.calcMeanMemoryUsageTotal,
  (req: Request, res: Response) => {
    res.status(200).json(res.locals.data);
  }
);

router.post(
  '/memoryUsageDiff/:period',
  cookieController.getCookieCredentials,
  credController.getCreds,
  lambdaController.getFunctions,
  logController.getLambdaUsageEachFunc,
  analysisController.calcLambdaMemoryDiff,
  (req: Request, res: Response) => {
    res.status(200).json(res.locals.data);
  }
);

/* Step Function Metrics */
router.post(
  '/stateMetricsByFunc/:metric/:period/:stat',
  cookieController.getCookieCredentials,
  credController.getCreds,
  stepController.getStateMetricByFunc,
  (req: Request, res: Response) => {
    res.status(200).json(res.locals.lambdaMetricsAllFuncs);
  }
);

export default router;
