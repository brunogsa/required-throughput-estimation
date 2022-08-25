const getWaitingTimes = (reqArrivingPerMin, reqHandledPerMin, totalMinsReqsArrive) => {
  const waitingReqs = [];
  const handledReqs = [];

  for (let i = 0; i < totalMinsReqsArrive; i++) {
    for (let waitingReq of waitingReqs) {
      waitingReq.waitedInMin += 1;
    }

    for (let j = 0; j < reqArrivingPerMin; j++) {
      waitingReqs.push({
        waitedInMin: 0,
      })
    }

    for (let j = 0; j < reqHandledPerMin; j++) {
      if (waitingReqs.length <= 0) break;

      handledReqs.push(
        waitingReqs.shift(),
      );
    }
  }

  let maxWaitedInMin = 0;
  let totalWaitingInMin = 0;

  for (let req of handledReqs) {
    totalWaitingInMin += req.waitedInMin;

    if (req.waitedInMin > maxWaitedInMin) {
      maxWaitedInMin = req.waitedInMin;
    }
  }

  const avgWaitedInMin = handledReqs.length > 0 ? (totalWaitingInMin / handledReqs.length) : 0;

  return {
    waitingReqs: waitingReqs.length,
    maxWaitedInMin,
    avgWaitedInMin,
  };
};

const searchMinimumRequiredThroughput = (
  reqArrivingPerMin,
  totalMinsReqsArrive,
  maximumWaitingTimeInMin,
  allowedDeviation,
) => {
  const MAX_ATTEMPTS = 20;

  const checkIfWithinAllowedDeviation = (ans, maxTime, dev) => (
    (ans.maxWaitedInMin <= maxTime + dev)
    && (ans.maxWaitedInMin >= maxTime - dev)
  );

  let attempts = 0;
  let upperBound = reqArrivingPerMin;
  let lowerBound = 1
  let currentTroughput = lowerBound;

  let answer = getWaitingTimes(
    reqArrivingPerMin,
    currentTroughput,
    totalMinsReqsArrive,
  );

  let isWithinAllowedDeviation = checkIfWithinAllowedDeviation(
    answer,
    maximumWaitingTimeInMin,
    allowedDeviation
  );

  let delta = Math.abs(maximumWaitingTimeInMin - answer.maxWaitedInMin);

  let bestAnswerTillNow = {
    throughput: currentTroughput,
    answer,
    delta,
  };

  console.log(`
    attempts = ${attempts}
    currentTroughput = ${currentTroughput}
    upperBound = ${upperBound}
    lowerBound = ${lowerBound}
    maxWaitedInMin = ${answer.maxWaitedInMin}
    avgWaitedInMin = ${answer.avgWaitedInMin}
    isWithinAllowedDeviation = ${isWithinAllowedDeviation}
  `);

  while (!isWithinAllowedDeviation) {
    attempts++;

    if (attempts >= MAX_ATTEMPTS) {
      console.log(`Returning best result after ${MAX_ATTEMPTS} ..`);

      return {
        minimumRequiredThroughput: bestAnswerTillNow.throughput,
        ...bestAnswerTillNow.answer,
      };
    }

    if (answer.maxWaitedInMin > maximumWaitingTimeInMin) {
      lowerBound = currentTroughput;

      currentTroughput += Math.ceil(
        (upperBound - lowerBound) / 2
      );
    } else {
      upperBound = currentTroughput;

      currentTroughput -= Math.ceil(
        (upperBound - lowerBound) / 2
      );
    }

    answer = getWaitingTimes(
      reqArrivingPerMin,
      currentTroughput,
      totalMinsReqsArrive,
    );

    isWithinAllowedDeviation = checkIfWithinAllowedDeviation(
      answer,
      maximumWaitingTimeInMin,
      allowedDeviation
    );

    console.log(`
      attempts = ${attempts}
      currentTroughput = ${currentTroughput}
      upperBound = ${upperBound}
      lowerBound = ${lowerBound}
      maxWaitedInMin = ${answer.maxWaitedInMin}
      avgWaitedInMin = ${answer.avgWaitedInMin}
      isWithinAllowedDeviation = ${isWithinAllowedDeviation}
    `);

    delta = Math.abs(maximumWaitingTimeInMin - answer.maxWaitedInMin);

    if (delta < bestAnswerTillNow.delta) {
      bestAnswerTillNow = {
        throughput: currentTroughput,
        answer,
        delta,
      };
    }
  }

  return {
    minimumRequiredThroughput: currentTroughput,
    ...answer,
  };
};



// Case A: Get max/avg waiting time, and time for emptying the queue
// =================================================================
// const REQUESTS_ARRIVING_PER_MIN = 75;
// const REQUESTS_HANDLED_PER_MIN = 70;
// const MAX_REQS_HANDLED_PER_MIN = 100;
// const TOTAL_NUM_OF_MINUTES_REQUESTS_ARRIVE = (23 - 8) * 60;

// const answer = getWaitingTimes(
//   REQUESTS_ARRIVING_PER_MIN,
//   REQUESTS_HANDLED_PER_MIN,
//   TOTAL_NUM_OF_MINUTES_REQUESTS_ARRIVE,
// );

// console.log(`Maximum time waiting: ${answer.maxWaitedInMin / 60} h`);
// console.log(`Average time waiting: ${answer.avgWaitedInMin / 60} h`);
// console.log(`Time to eliminate the lag: ${answer.waitingReqs / MAX_REQS_HANDLED_PER_MIN / 60} h`);



// Case B: Find the minimum required throughput to fulfill the tolerable delay
// =================================================================
const REQUESTS_ARRIVING_PER_MIN = 110;
const TOTAL_NUM_OF_MINUTES_REQUESTS_ARRIVE = (23 - 8) * 60;
const MAXIMUM_WAITING_TIME_IN_MIN = 120;
const ALLOWED_DEVIATION = 2;

const answer = searchMinimumRequiredThroughput(
  REQUESTS_ARRIVING_PER_MIN,
  TOTAL_NUM_OF_MINUTES_REQUESTS_ARRIVE,
  MAXIMUM_WAITING_TIME_IN_MIN,
  ALLOWED_DEVIATION,
);

console.log(`Minimum required throughput: ${answer.minimumRequiredThroughput} req/min`);
console.log(`Maximum time waiting: ${answer.maxWaitedInMin} min`);
console.log(`Average time waiting: ${answer.avgWaitedInMin} min`);
console.log(`Time to eliminate the lag: ${answer.waitingReqs / answer.minimumRequiredThroughput / 60} h`);
