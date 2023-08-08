# Medical Assistant App

The Medical Assistant app is a React Native application that utilizes OpenAI's Whisper and GPT-4 models to transcribe and process audio input into professional medical notes. 

## Features

- Record audio notes
- Transcribe recorded audio into text using OpenAI's Whisper model
- Send transcribed text to OpenAI's GPT-4 model to transform it into a professional medical note
- View GPT-4's output

## Setup

### Prerequisites

- Node.js
- Expo CLI

### Installing Dependencies

```bash
npm install
```

### Running the App

```bash
# choose one of the following options
npm run web
npm run android
npm run ios
```

## Usage

1. Press the "Start Recording" button to start recording your note.
2. Press the "Pause Recording" button if you need to pause the recording.
3. Press the "Stop Recording" button once you're done.
4. You can send the transcribed text to GPT-4 by pressing the "Send to GPT" button.
5. The response from GPT-4 will be displayed on the screen.

## Environment Variables (deprecated)

Create a `.env` file in the root directory and add the following variables:

```env
OPENAI_API_KEY=your_openai_api_key
```

Replace `your_openai_api_key` with your actual OpenAI API key.
