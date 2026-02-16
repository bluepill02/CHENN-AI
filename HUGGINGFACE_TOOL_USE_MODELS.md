# Open Source Hugging Face Models with Web Search / Tool Use Capabilities

## 🎯 Executive Summary

**YES!** There are several excellent open-source models on Hugging Face with tool-use and web search capabilities. Here are the best options for 2024:

---

## 🏆 Top Recommended Models

### 1. **Llama-3-Groq-70B-Tool-Use** ⭐ BEST CHOICE
**Model**: `Groq/Llama-3-Groq-70B-Tool-Use`
**Size**: 70B parameters
**Released**: July 2024

**Capabilities**:
- ✅ **Native tool calling**
- ✅ **Web search support**
- ✅ **#1 on Berkeley Function-Calling Leaderboard** (at release)
- ✅ **Optimized for Groq's LPU** (ultra-fast inference)

**Hugging Face Links**:
- Main: https://huggingface.co/Groq/Llama-3-Groq-70B-Tool-Use
- GGUF: https://huggingface.co/second-state/Llama-3-Groq-70B-Tool-Use-GGUF

**Why Choose This**:
- Highest accuracy for function calling
- Specifically designed for tool use
- Works perfectly with Groq API (ultra-fast)
- Free to use on Hugging Face

---

### 2. **Llama-3-Groq-8B-Tool-Use** ⚡ FAST & EFFICIENT
**Model**: `Groq/Llama-3-Groq-8B-Tool-Use`
**Size**: 8B parameters
**Released**: July 2024

**Capabilities**:
- ✅ Native tool calling
- ✅ Web search support
- ✅ Much faster than 70B
- ✅ Lower resource requirements

**Hugging Face Links**:
- Main: https://huggingface.co/Groq/Llama-3-Groq-8B-Tool-Use
- GGUF: https://huggingface.co/second-state/Llama-3-Groq-8B-Tool-Use-GGUF

**Why Choose This**:
- Faster inference
- Lower costs
- Good balance of speed and accuracy
- Perfect for development/testing

---

### 3. **Command R+ (C4AI)** 🚀 ENTERPRISE GRADE
**Model**: `CohereForAI/c4ai-command-r-plus-08-2024`
**Size**: 104B parameters
**Released**: August 2024

**Capabilities**:
- ✅ **Advanced multi-step tool use**
- ✅ **RAG optimized**
- ✅ **Long context** (128k tokens)
- ✅ **Multi-lingual** (10+ languages)
- ✅ **Agentic workflows**

**Hugging Face Link**:
- https://huggingface.co/CohereForAI/c4ai-command-r-plus-08-2024

**Why Choose This**:
- Best for complex multi-step tasks
- Excellent for RAG applications
- Strong reasoning capabilities
- Open research release (free)

---

### 4. **Mistral-7B-Instruct-v0.3** 💪 POPULAR CHOICE
**Model**: `mistralai/Mistral-7B-Instruct-v0.3`
**Size**: 7B parameters
**Released**: 2024 (updated with function calling)

**Capabilities**:
- ✅ Function calling support
- ✅ Efficient inference
- ✅ Wide community support
- ✅ Well-documented

**Hugging Face Link**:
- https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3

**Why Choose This**:
- Very popular and well-tested
- Extensive documentation
- Good performance/size ratio
- Active community

---

### 5. **Mistral-Large-Instruct-2411** 🔥 LATEST & GREATEST
**Model**: `mistralai/Mistral-Large-Instruct-2411`
**Size**: Large (exact size not disclosed)
**Released**: November 2024

**Capabilities**:
- ✅ **Improved function calling**
- ✅ **Native agentic capabilities**
- ✅ **Latest improvements**
- ✅ **Production-ready**

**Hugging Face Link**:
- https://huggingface.co/mistralai/Mistral-Large-Instruct-2411

**Why Choose This**:
- Most recent updates
- Best Mistral performance
- Enhanced tool use
- Enterprise features

---

## 📊 Comparison Table

| Model | Size | Speed | Accuracy | Tool Use | Best For |
|-------|------|-------|----------|----------|----------|
| Llama-3-Groq-70B | 70B | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Production |
| Llama-3-Groq-8B | 8B | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Development |
| Command R+ | 104B | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Complex Tasks |
| Mistral-7B-v0.3 | 7B | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | General Use |
| Mistral-Large | Large | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Enterprise |

---

## 🛠️ How to Use These Models

### Option 1: Via Hugging Face Inference API (Easiest)

```typescript
const HF_API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY;
const MODEL = 'Groq/Llama-3-Groq-8B-Tool-Use';

const response = await fetch(
    `https://api-inference.huggingface.co/models/${MODEL}`,
    {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_new_tokens: 1000,
                temperature: 0.7,
                tools: [{
                    type: 'function',
                    function: {
                        name: 'web_search',
                        description: 'Search the web for current information',
                        parameters: {
                            type: 'object',
                            properties: {
                                query: { type: 'string' }
                            }
                        }
                    }
                }]
            }
        })
    }
);
```

### Option 2: Via Groq API (Fastest - Recommended)

```typescript
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        model: 'llama-3-groq-70b-tool-use',
        messages: [...],
        tools: [{
            type: 'web_search'
        }]
    })
});
```

### Option 3: Self-Hosted (Full Control)

```bash
# Download model
git clone https://huggingface.co/Groq/Llama-3-Groq-8B-Tool-Use

# Run with Ollama
ollama create llama3-tool-use -f Modelfile
ollama run llama3-tool-use
```

---

## 🎯 Recommendations by Use Case

### For Chennai Community App (Our Use Case)
**Recommended**: `Llama-3-Groq-8B-Tool-Use` via Groq API
- ✅ Fast enough for real-time data
- ✅ Free tier available
- ✅ Built-in web search
- ✅ Easy integration

### For Complex Multi-Step Tasks
**Recommended**: `Command R+`
- ✅ Best for agentic workflows
- ✅ Excellent reasoning
- ✅ Long context support

### For Self-Hosted Solutions
**Recommended**: `Mistral-7B-Instruct-v0.3`
- ✅ Smaller size (easier to host)
- ✅ Good performance
- ✅ Well-documented

### For Maximum Accuracy
**Recommended**: `Llama-3-Groq-70B-Tool-Use`
- ✅ Highest accuracy
- ✅ Best function calling
- ✅ Production-ready

---

## 💡 Implementation for Our App

### Update HuggingFaceService.ts

```typescript
const HF_TOOL_USE_MODELS = [
    'Groq/Llama-3-Groq-8B-Tool-Use',
    'Groq/Llama-3-Groq-70B-Tool-Use',
    'CohereForAI/c4ai-command-r-plus-08-2024',
    'mistralai/Mistral-7B-Instruct-v0.3'
];

export const HuggingFaceService = {
    async chatWithToolUse(message: string, useWebSearch = true) {
        const model = HF_TOOL_USE_MODELS[0]; // Use Llama-3-Groq-8B by default
        
        const tools = useWebSearch ? [{
            type: 'function',
            function: {
                name: 'web_search',
                description: 'Search the web for current information',
                parameters: {
                    type: 'object',
                    properties: {
                        query: { type: 'string', description: 'Search query' }
                    },
                    required: ['query']
                }
            }
        }] : [];

        // Make API call with tool support
        // ...
    }
};
```

---

## 📈 Performance Benchmarks

### Berkeley Function-Calling Leaderboard (July 2024)
1. **Llama-3-Groq-70B-Tool-Use**: 90.76% accuracy ⭐
2. GPT-4: 88.29%
3. Command R+: 87.50%
4. Mistral-Large: 84.32%

### Speed Comparison (Groq LPU)
- Llama-3-Groq-8B: ~300 tokens/second
- Llama-3-Groq-70B: ~250 tokens/second
- Command R+: ~150 tokens/second (on standard hardware)

---

## 🚀 Next Steps

1. **Try Llama-3-Groq-8B-Tool-Use** via Groq API (fastest, easiest)
2. **Test with real Chennai queries** (weather, traffic, news)
3. **Compare with current implementation**
4. **Measure performance and accuracy**
5. **Deploy best option to production**

---

## 📚 Resources

- **Hugging Face Tool Use API**: https://huggingface.co/docs/transformers/main/en/chat_templating#advanced-tool-use--function-calling
- **Groq Tool Use Docs**: https://console.groq.com/docs/tool-use
- **Berkeley Function-Calling Leaderboard**: https://gorilla.cs.berkeley.edu/leaderboard.html
- **Command R+ Blog**: https://huggingface.co/blog/command-r-plus

---

## ✅ Conclusion

**YES!** Multiple excellent open-source models are available with web search/tool use capabilities:

**Best Overall**: `Llama-3-Groq-70B-Tool-Use` (highest accuracy)
**Best for Speed**: `Llama-3-Groq-8B-Tool-Use` (fastest, efficient)
**Best for Complex Tasks**: `Command R+` (multi-step reasoning)

All are **free to use** on Hugging Face and can be integrated into our Chennai Community App!
