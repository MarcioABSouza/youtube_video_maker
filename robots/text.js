const algorithmia = require('algorithmia');
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;
const sentenceBoundaryDetection = require('sbd');

const watsonApiKey = require('../credentials/watson-nlu.json').apikey
const watsonUrl = require('../credentials/watson-nlu.json').url
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');


const nlu = new NaturalLanguageUnderstandingV1({
    version: '2018-04-05',
    authenticator: new IamAuthenticator({
        apikey: watsonApiKey,
    }),
    url: watsonUrl,
});



async function robot(content) {

    await fechContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitMaxumumSentences(content)
    await fetchKeywordsOfAllSentences(content)

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
        sentences.forEach(sentence => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }

    async function fectchWatsonAndReturnKeywords(sentence) {
        return new Promise((resolve, reject) => {
            nlu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                }
            }, (error, response) => {
                if (error) {
                    throw error
                }
                const keywords = response.result.keywords.map(keyword => {
                    return keyword.text
                })
                resolve(keywords)
            })
        })
    }

    function limitMaxumumSentences(content){
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    async function fetchKeywordsOfAllSentences(content){
        for( const sentence of content.sentences){
            sentence.keywords = await fectchWatsonAndReturnKeywords(sentence.text)
        }
        console.log(JSON.stringify(content, null, 4))
    }
}


module.exports = robot;