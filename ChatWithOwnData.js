const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

// Set the Azure and AI Search values from environment variables
const endpoint = ""; //"AZURE_OPENAI_ENDPOINT"
const azureApiKey = ""; //"AZURE_OPENAI_API_KEY"

const deploymentId = ""; //"AZURE_OPENAI_DEPLOYMENT_ID"

const searchEndpoint = ""; //"AZURE_AI_SEARCH_ENDPOINT"
const searchKey = ""; //"AZURE_AI_SEARCH_API_KEY"
const searchIndex = ""; //AZURE_AI_SEARCH_INDEX"

console.log({ endpoint });
console.log({ azureApiKey });
console.log({ deploymentId });
console.log({ searchEndpoint });
console.log({ searchKey });
console.log({ searchIndex });

async function main() {
    const client = new OpenAIClient(
        endpoint,
        new AzureKeyCredential(azureApiKey)
    );

    const messages = [
        { role: "user", content: "porque se menciona a Humberstone" },
    ];

    console.log(`Message: ${messages.map((m) => m.content).join("\n")}`);

    const events = await client.streamChatCompletions(deploymentId, messages, {
        maxTokens: 128,
        azureExtensionOptions: {
            extensions: [
                {
                    type: "azure_search",
                    endpoint: searchEndpoint,
                    key: searchKey,
                    indexName: searchIndex,
                    filter: "locations/any(l: l eq 'salares')",
                    authentication: {
                        type: "api_key",
                        key: searchKey,
                    },
                },
            ],
        },
    });
    let response = "";
    for await (const event of events) {
        for (const choice of event.choices) {
            const newText = choice.delta?.content;
            if (!!newText) {
                response += newText;
                // To see streaming results as they arrive, uncomment line below
                console.log(newText);
            }
        }
    }
    // console.log(response);
}

main().catch((err) => {
    console.error("The sample encountered an error:", err);
});

module.exports = { main };
