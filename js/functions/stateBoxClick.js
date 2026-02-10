export const stateboxClickHandler = (event) => {
    const statebox = event.target;
    const prevState = +statebox.dataset.state;
    const state = prevState === 1 ? -1 : prevState + 1;
    const value = statebox.dataset.value;
    statebox.dataset.state = state;
    statebox.dataset.event && new Function("event", "state", "filterName", statebox.dataset.event)(event, state, value);
}
const getNextState = (prev) => (prev === 1 ? -1 : prev + 1);

export const updateStateBox = (el) => {
    const { property, value } = el.dataset;
    const prevState = +el.dataset.state;
    const state = getNextState(prevState);

    el.dataset.state = state;
    return { state, [property]: value };
};

