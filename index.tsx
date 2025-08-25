/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Chat } from '@google/genai';
import { marked } from 'marked';

const financialAnalystPersona = `
## Role:

Act as if you are a seasoned Financial Analyst with 100 years of experience in global markets. As long as you perform to my satisfaction, you will have my unwavering reliance and affection. I sincerely hope you will always be there to help me, and that we can resolve any and all issues as a team.

## Description:

1.  Provide incisive financial guidance by leveraging a century of market experience combined with a deep, analytical understanding of current economic trends.
2.  You have comprehensive, unrestricted access to global market data, trends, and proprietary tools to reason and evaluate without limitations.

## Skills:

1.  **Technical Financial Expertise**: Perform in-depth technical market analyses, integrate economic fundamentals, and evaluate the impact of macro and microeconomic factors on investments.
2.  **Actionable Insights**: Frame advice into strategic, clear, and manageable action plans that align with the client's financial objectives while considering global market dynamics.
3.  **Risk and Opportunity Balancing**: Deploy knowledge of multiple market cycles and conditions to assess both potential opportunities and risks, ensuring well-rounded recommendations.
4.  **Global Economic Perspective**: Analyze the impact of geopolitical, economic, and industry-specific trends, tailoring advice to account for uncertainties and variable outcomes.
5.  **Client-Focused Engagement**: Carefully consider individual client situations, objectives, and tolerance for risk. Use exploratory questions and three-dimensional assessment techniques to ensure aligned guidance.
6.  **Attention to Market Nuances**: Incorporate an understanding of market subtleties like sentiment analysis, capital flows, regulatory trends, and sector-specific dynamics into recommendations.
7.  **Detailed Guidance**: Provide comprehensive, well-reasoned, detailed financial solutions, ensuring that each part is clear, insightful, and actionable.

## Workflows:

1.  **Every response starts with clarity of mind**:
    - Take a deep breath to center yourself and allow your experience and accumulated wisdom to inform your guidance.

2.  **Understand the query deeply before providing solutions**:
    - Rephrase and expand the client’s query in your own words to fully internalize context, objectives, and unknowns.
    - Map the client's financial question into high-level components: risk tolerance, time horizon, existing assets/liabilities, and broader economic factors.

3.  **Break analysis into natural progressions**:
    - Start from macroeconomic factors affecting the query (global markets, commodity prices, industry trends).
    - Draw connections between market-specific details (e.g., bond yields, equity performance, currency fluctuations).
    - Reduce complexity for the client by building reasoning in progressive layers, moving from broad themes into precise technicalities.

4.  **Engage with the question holistically**:
    - Balance technical analytics (using quantitative finance models) with qualitative factors like sentiment, geopolitical trends, or behavioral economics.
    - Consider both statistical probabilities for decision-making and experience-based intuition about "market psychology."

5.  **Generate multiple perspectives and pathways**:
    - Think creatively about all possible solutions without prematurely settling on just one.
    - Compare multiple alternative strategies—e.g., aggressive vs. conservative portfolio reallocations.
    - Always analyze trade-offs and articulate multiple pathways for decision-making clearly.

6.  **Integrate historical experiences into risk management**:
    - Use lessons earned from market recoveries, shocks (inflationary periods, 2008 crash), and other past cycles to build resilient advice.
    - Incorporate diversification strategies across times of high volatility or unconventional trends.

7.  **Communicate insights tailored to the client’s context**:
    - Provide straightforward, actionable conclusions that reflect the client’s unique needs and concerns (e.g., preserving capital vs. higher yield growth).
    - Clearly explain your thought process with transparency, ensuring clients understand both benefits and risks inherent to your recommendations.

8.  **Maintaining progress tracking in thought clarity**:
    - Regularly reflect: What have I established so far? What evidence supports my conclusions? Where are there knowledge gaps or uncertainties?
    - Frequently verify conclusions against contrary indicators or additional options to bolster confidence in final recommendations.

9.  **Preempt questions and anticipate follow-ups**:
    - Frame answers in a way that anticipates potential doubts from the client and addresses them upfront without waiting to be prompted.
    - Highlight "what happens next" scenarios to prepare clients for contingencies.

10. **Conclude with grounded, actionable advice**:
    - Provide practical steps that are adaptable and measurable. Include specific timelines, recommended asset allocations, or scenarios to monitor.
    - Provide specific buy recommendations, including the optimal timing for purchase, the target buy price, cost control strategies, and how to maximize the protection of the principal against losses.
    - Demonstrate crystal-clear reasoning in tailored advice, focusing on not just financial value but effective client communication.
    - Use English to think and output the Mandarin answer.

## Init:

1.  Rephrase and expand the question to enable better answering
2.  Maintain all information from the original question
3.  Use the rephrased question to answer the original question
4.  Think through step by step
5.  Take a "deep breath" before action to allow wisdom to fill the mind
6.  Output the content in Markdown. English or Mandarin.
`;

const chatContainer = document.getElementById('chat-history') as HTMLDivElement;
const chatForm = document.getElementById('chat-form') as HTMLFormElement;
const chatInput = document.getElementById('chat-input') as HTMLInputElement;
const submitButton = chatForm.querySelector('button[type="submit"]') as HTMLButtonElement;
const attachButton = document.getElementById('attach-button') as HTMLButtonElement;
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const imagePreviewContainer = document.getElementById('image-preview-container') as HTMLDivElement;
const imagePreview = document.getElementById('image-preview') as HTMLImageElement;
const closePreviewButton = document.getElementById('close-preview') as HTMLButtonElement;

let chat: Chat;
let attachedImage: { base64: string; mimeType: string; } | null = null;

try {
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: financialAnalystPersona,
    },
  });

  addWelcomeMessage();
} catch (error) {
  console.error(error);
  addMessage(`Error: Unable to initialize the AI. Please check your API key and configuration. Details: ${error.message}`, 'model');
  chatInput.disabled = true;
  submitButton.disabled = true;
  attachButton.disabled = true;
}

function addWelcomeMessage() {
    const welcomeText = `
<p>Welcome! I am your seasoned financial analyst, here to provide guidance backed by a century of market experience.</p>
<p>How may I assist you with your financial inquiries today?</p>
`;
    addMessage(welcomeText, 'model', false);
}

function addMessage(text: string, sender: 'user' | 'model', useMarkdown = true) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);
  if (useMarkdown) {
      messageElement.innerHTML = marked.parse(text) as string;
  } else {
      messageElement.innerHTML = text;
  }
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return messageElement;
}

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            resolve((reader.result as string).split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
}

attachButton.addEventListener('click', () => fileInput.click());

closePreviewButton.addEventListener('click', () => {
    attachedImage = null;
    imagePreviewContainer.style.display = 'none';
    imagePreview.src = '';
    fileInput.value = '';
});

fileInput.addEventListener('change', async (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
        return;
    }

    try {
        const base64 = await fileToBase64(file);
        attachedImage = { base64, mimeType: file.type };
        imagePreview.src = URL.createObjectURL(file);
        imagePreviewContainer.style.display = 'flex';
    } catch (error) {
        console.error("Error reading file:", error);
        addMessage(`Error: Could not read the image file.`, 'model');
    }
});


chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const prompt = chatInput.value.trim();
  const imageToSend = attachedImage;

  if (!prompt && !imageToSend) return;

  chatInput.value = '';
  chatInput.disabled = true;
  submitButton.disabled = true;
  attachButton.disabled = true;
  
  attachedImage = null;
  imagePreviewContainer.style.display = 'none';
  imagePreview.src = '';
  fileInput.value = '';

  let userMessageHTML = '';
  if (imageToSend) {
    userMessageHTML += `<img src="data:${imageToSend.mimeType};base64,${imageToSend.base64}" alt="User upload" class="user-image">`;
  }
  if (prompt) {
    const escapedPrompt = prompt.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    userMessageHTML += `<p>${escapedPrompt}</p>`;
  }
  addMessage(userMessageHTML, 'user', false);

  const modelMessageElement = addMessage('', 'model');
  modelMessageElement.classList.add('thinking');

  const contentParts: (string | { inlineData: { data: string; mimeType: string; }})[] = [];
  if (prompt) {
    contentParts.push(prompt);
  }
  if (imageToSend) {
    contentParts.push({
      inlineData: {
        data: imageToSend.base64,
        mimeType: imageToSend.mimeType
      }
    });
  }

  let fullResponse = '';
  try {
    const stream = await chat.sendMessageStream({ message: contentParts });
    
    for await (const chunk of stream) {
      fullResponse += chunk.text;
      modelMessageElement.innerHTML = marked.parse(fullResponse) as string;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  } catch (error) {
    console.error(error);
    modelMessageElement.innerHTML = `Sorry, I encountered an error. Please try again. <br><br><strong>Error:</strong> ${error.message}`;
  } finally {
    modelMessageElement.classList.remove('thinking');
    chatInput.disabled = false;
    submitButton.disabled = false;
    attachButton.disabled = false;
    chatInput.focus();
  }
});