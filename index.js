
const robots = {
    state: require('./robots/state'),
    input: require('./robots/input'),
    text: require('./robots/text'), 
    image: require('./robots/image')
} 

async function start() {
   
    robots.input()
    await robots.text();
    await robots.image()
}

start()