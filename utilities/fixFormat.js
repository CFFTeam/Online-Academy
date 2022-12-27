export const fixNumberFormat = (number, slash = '.') => { 
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, slash); 
};

export const fixDateFormat = (date, monthFm = 'numeric', yearFm = 'numeric', slash = '-') => {
    return new Date(date).toLocaleString('en-US', { month: monthFm, year: yearFm }).replaceAll('/', slash);
};