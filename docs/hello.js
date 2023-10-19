const imports= {
    greeting: '[data-lz\\:export="greeting"]',
    name: 'input[name="name"]',
};

function greet() {
    this.greeting.textContent = `Hello, ${this.name.value}!`;
}

function onclick(event) {
    console.log(event)
}

export {
    imports,
    greet,
    onclick
}