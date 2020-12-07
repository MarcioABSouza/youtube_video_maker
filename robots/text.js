const algorithmia = require('algorithmia');
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;
const sentenceBoundaryDetection = require('sbd')

async function robot(content) {

    await fechContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)

    async function fechContentFromWikipedia(content) {

        try {
            const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
            const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
            const wikipediaResponse = await wikipediaAlgorithm.pipe(
                {
                    articleName: content.searchTerm,
                    lang: "pt"
                })
            const wikipediaContent = wikipediaResponse.get()
            content.sourceContentOriginal = wikipediaContent.content

        } catch (error) {
            console.log(error)
        }
    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDates = removeDates(withoutBlankLinesAndMarkdown)
        content.sourceContentSanitized = withoutDates;

        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkdown = allLines.filter(line => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                } else {
                    return true
                }
            })
            return withoutBlankLinesAndMarkdown.join(' ')
        }

        function removeDates(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ')
        }
    }

    function breakContentIntoSentences(content) {
        content.sentences = [];
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach(sentence=>{
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
        console.log(content)
    }
}


module.exports = robot;