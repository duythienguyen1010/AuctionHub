exports.timeCalculation = (trade) => {
    let currentTime = new Date();
    let ms = trade.expiration.getTime() - currentTime.getTime();

    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const daysms = ms % (24 * 60 * 60 * 1000);
    const hours = Math.floor(daysms / (60 * 60 * 1000));
    const hoursms = ms % (60 * 60 * 1000);
    const minutes = Math.floor(hoursms / (60 * 1000));
    const minutesms = ms % (60 * 1000);
    const sec = Math.floor(minutesms / 1000);

    let time = {
        ms: ms,
        day: days,
        hour: hours,
        minute: minutes,
        second: sec,
    };
    if (ms <= 0) {
        time = {
            ms: 0,
            day: 0,
            hour: 0,
            minute: 0,
            second: 0,
        };
    }
    return time;
};

exports.isWinner = (trade, user) => {
    if ((trade.bestBidder = user)) {
        return true;
    } else {
        return false;
    }
};
