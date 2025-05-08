import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true // This is required for client-side usage
});

export default openai; 