import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const engine = new OpenAIApi(configuration);

const model = 'gpt-3.5-turbo-16k';

const rawData = fs.readdirSync('docs').map((file) => {
    const fileName = file.split('.')[0];
    const raw = fs.readFileSync(path.join('docs', `/${file}`), 'utf8');
    const temp = JSON.parse(raw);
    const [data] = Object.values(temp);
    return {
        fileName,
        data,
    };
});

const getReadable = async (data) => {
    const text = data.map(({ key, value }) => `${key}: ${JSON.stringify(value)}`).join('\n');
    const response = await engine
        .createChatCompletion({
            model,
            messages: [
                {
                    role: 'system',
                    content: text,
                },
                {
                    role: 'user',
                    content:
                        'Please provide a human readable version of this data. Should be understandable to 18 year old, and include all of the data. No warnings, no other text shold be present in your answer.',
                },
            ],
        })
        .catch((err) => void console.log(err.response.data.error.message));
    if (!response) return await getReadable(data);
    console.log(response.data.choices[0].message?.content, "\n\n");
    return response.data.choices[0].message?.content;
};

const data = rawData.map(async (item) => {
    const { fileName, data } = item;
    const results = Object.entries(data)
        .filter(([key, value]) => ![null, 'None'].includes(value) && key !== 'image')
        .map(([key, value]) => {
            const capitaliseToSpaced = key.replace(/([A-Z])/g, ' $1');

            return { key: capitaliseToSpaced, value };
        });

    return {
        id: fileName,
        results: results,
        readable: await getReadable(results),
    };
});

Promise.all(data).then((data) => fs.writeFileSync(path.join('data', 'data.json'), JSON.stringify(data, null, 2)));
