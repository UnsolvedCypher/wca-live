export const centisecondsToClockFormat = centiseconds => {
  if (!Number.isFinite(centiseconds)) return null;
  if (centiseconds === 0) return '';
  if (centiseconds === -1) return 'DNF';
  if (centiseconds === -2) return 'DNS';
  return new Date(centiseconds * 10)
    .toISOString()
    .substr(11, 11)
    .replace(/^[0:]*(?!\.)/g, '');
};

export const decodeMbldResult = value => {
  if (value <= 0) return { solved: 0, attempted: 0, centiseconds: value };
  const missed = value % 100;
  const seconds = Math.floor(value / 100) % 1e5;
  const difference = 99 - (Math.floor(value / 1e7) % 100);
  const solved = difference + missed;
  const attempted = solved + missed;
  const centiseconds = seconds === 99999 ? null : seconds * 100;
  return { solved, attempted, centiseconds };
};

export const encodeMbldResult = ({ solved, attempted, centiseconds }) => {
  if (centiseconds <= 0) return centiseconds;
  const missed = attempted - solved;
  const dd = 99 - (solved - missed);
  const seconds = Math.round(
    (centiseconds || 9999900) / 100
  ); /* 99999 seconds is used for unknown time. */
  return dd * 1e7 + seconds * 1e2 + missed;
};

export const validateMbldResult = ({ attempted, solved, centiseconds }) => {
  if (!attempted || solved > attempted) {
    return { solved, attempted: solved, centiseconds };
  }
  if (solved < attempted / 2 || solved <= 1) {
    return { solved: 0, attempted: 0, centiseconds: -1 };
  }
  if (centiseconds > 10 * 60 * 100 * Math.min(6, attempted)) {
    return { solved: 0, attempted: 0, centiseconds: -1 };
  }
  return { solved, attempted, centiseconds };
};

export const mbldResultToPoints = result => {
  const { solved, attempted } = decodeMbldResult(result);
  const missed = attempted - solved;
  return solved - missed;
};

const betterThan = (result, otherResult, eventId) => {
  if (result <= 0) return false;
  if (eventId === '333mbf') {
    return mbldResultToPoints(result) > mbldResultToPoints(otherResult);
  }
  return result < otherResult;
};

export const meetsCutoff = (attempts, cutoff, eventId) => {
  if (!cutoff) return true;
  const { numberOfAttempts, attemptResult } = cutoff;
  return attempts
    .slice(0, numberOfAttempts)
    .some(attempt => betterThan(attempt, attemptResult, eventId));
};

const formatMbldResult = result => {
  const { solved, attempted, centiseconds } = decodeMbldResult(result);
  const clockFormat = new Date(centiseconds * 10)
    .toISOString()
    .substr(11, 8)
    .replace(/^[0:]*(?!\.)/g, '');
  return `${solved}/${attempted} ${clockFormat}`;
};

export const formatResult = (result, eventId, isAverage = false) => {
  if (result === 0) return '';
  if (result === -1) return 'DNF';
  if (result === -2) return 'DNS';
  if (eventId === '333fm') {
    return isAverage ? (result / 100).toFixed(2) : result.toString();
  }
  if (eventId === '333mbf') return formatMbldResult(result);
  return centisecondsToClockFormat(result);
};

export const attemptsWarning = (attempts, eventId) => {
  if (eventId === '333mbf') {
    const lowTimeIndex = attempts.findIndex(attempt => {
      const { attempted, centiseconds } = decodeMbldResult(attempt);
      return attempt > 0 && centiseconds / attempted < 30 * 100;
    });
    if (lowTimeIndex !== -1) {
      return `
        The results you're trying to submit seem to be impossible:
        attempt ${lowTimeIndex + 1} is done in
        less than 30 seconds per cube tried.
        If you want to enter minutes, don't forget to add two zeros
        for centiseconds at the end of the score.
      `;
    }
  } else {
    const completedAttempts = attempts.filter(attempt => attempt > 0);
    if (completedAttempts.length > 0) {
      const bestSingle = Math.min(...completedAttempts);
      const worstSingle = Math.max(...completedAttempts);
      const inconsistent = worstSingle > bestSingle * 4;
      if (inconsistent) {
        return `
          The results you're trying to submit seem to be inconsistent.
          There's a big difference between the best single
          (${formatResult(bestSingle, eventId)}) and the worst single
          (${formatResult(worstSingle, eventId)}).
          Please check that the results are accurate.
        `;
      }
    }
  }
  return null;
};
