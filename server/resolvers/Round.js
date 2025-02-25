const { formatById } = require('../utils/formats');
const { parseActivityCode, eventById } = require('../utils/wcif');
const { roundName } = require('../utils/rounds');

module.exports = {
  format: ({ format }) => formatById(format),
  event: ({ id }, args, { competition }) => {
    const { eventId } = parseActivityCode(id);
    return eventById(competition.wcif, eventId);
  },
  name: ({ id, cutoff }, args, { competition }) => {
    const { eventId, roundNumber } = parseActivityCode(id);
    const event = eventById(competition.wcif, eventId);
    return roundName(roundNumber, event.rounds.length, cutoff);
  },
  results: (parent) => {
    return parent.results.map(result => ({ ...result, round: parent }));
  },
  open: ({ results }) => results.length > 0,
};
