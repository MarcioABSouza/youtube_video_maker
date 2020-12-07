const readline = require('readline-sync');

function userInput(content){

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askeAndReturnPrefix()
    
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

module.exports = userInput;