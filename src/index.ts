// Start by making sure the `assemblyai` package is installed.
// If not, you can install it by running the following command:
// npm install assemblyai

import { AssemblyAI, Sentiment, Transcript } from 'assemblyai';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || '',
});

const FILE_URL = 'https://assembly.ai/weaviate-podcast-109.mp3';

// You can also transcribe a local file by passing in a file path
// const FILE_URL = './path/to/file.mp3';

// Request parameters
const data = {
  audio: FILE_URL,
  sentiment_analysis: true,
};

const getSentences = async (transcript: Transcript) => {
  const { sentences } = await client.transcripts.sentences(transcript.id);
  console.log(`The transcript has ${sentences.length} sentences.`);
};

const getUtterances = async (transcript: Transcript) => {
  console.log('Utterances:', transcript.utterances);
  if (transcript.utterances) {
    for (const utterance of transcript.utterances!) {
      console.log(`Speaker ${utterance.speaker}: ${utterance.text}`);
    }
  }
};

const getSentiments = async (transcript: Transcript) => {
  const sentimentCount = transcript.sentiment_analysis_results!.reduce(
    (acc, { sentiment }) => {
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    },
    {} as Record<Sentiment, number>
  );

  console.log(
    `The transcript contains ${sentimentCount['POSITIVE'] || 0} positive, ${
      sentimentCount['NEUTRAL'] || 0
    } neutral, and ${sentimentCount['NEGATIVE'] || 0} negative utterances.`
  );
};

const getPromptResponse = async (transcript: Transcript, prompt: string) => {
  const { response } = await client.lemur.task({
    transcript_ids: [transcript.id],
    prompt,
    final_model: 'anthropic/claude-3-5-sonnet',
  });

  console.log(response);
};

const run = async () => {
  const transcript = await client.transcripts.transcribe(data);

  getSentences(transcript);

  getUtterances(transcript);

  getSentiments(transcript);

  const prompt1 = 'Provide a brief summary of the podcast.';
  getPromptResponse(transcript, prompt1);

  const prompt2 = 'Based on the transcript, what is agentic RAG?';
  getPromptResponse(transcript, prompt2);
};

run();
