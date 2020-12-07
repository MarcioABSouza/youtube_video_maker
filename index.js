
const robots = {
    state: require('./robots/state'),
    input: require('./robots/input'),
    text: require('./robots/text')
} 

async function start() {
   
    robots.input()
    await robots.text();
}

start()