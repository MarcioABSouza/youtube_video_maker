const readline = require('readline-sync');
const state = require('./state.js')


function robot(){

    const content = {
        maximumSentences:7
    }

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askeAndReturnPrefix()

    state.save(content)
    
    function askAndReturnSearchTerm(){
        return readline.question('  Escolha um termo para busca na Wikipedia:')
    }

    function askeAndReturnPrefix (){
        const prefixes = ['Quem é','Quem foi','O que é', 'O que foi', 'A história de'];
        const selectedPefixIndex = readline.keyInSelect(prefixes)
        const selectedPrefixText = prefixes[selectedPefixIndex];

        return selectedPrefixText
    }
}

module.exports = robot;