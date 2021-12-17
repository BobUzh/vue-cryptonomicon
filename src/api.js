export const loadTicker = (tickerName) =>
    fetch(
        `https://min-api.cryptocompare.com/data/price?fsym=${tickerName}&tsyms=USD`
    ).then(response => response.json());


export const loadTickerList = () =>
    fetch("https://min-api.cryptocompare.com/data/all/coinlist?summary=true")
        .then(response => response.json());
