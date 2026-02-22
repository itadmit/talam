import { globalSearch } from "@/actions/search";

// ==================== Chat Types ====================

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface SearchResultItem {
  type: string;
  id: string;
  title: string;
  snippet: string;
  url: string;
}

export interface ChatResponse {
  message: string;
  results?: SearchResultItem[];
}

// ==================== Provider Interface ====================

export interface ChatProvider {
  generateResponse(
    messages: ChatMessage[],
    context?: string[]
  ): Promise<ChatResponse>;
}

// ==================== Search-Only Provider (Default) ====================

export class SearchOnlyProvider implements ChatProvider {
  async generateResponse(messages: ChatMessage[]): Promise<ChatResponse> {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return { message: "לא הבנתי את השאלה. נסה שוב." };
    }

    const query = lastMessage.content.trim();
    if (query.length < 2) {
      return { message: "נא להזין לפחות 2 תווים לחיפוש." };
    }

    const results = await globalSearch(query, "all");

    if (results.length === 0) {
      return {
        message: `לא נמצאו תוצאות עבור "${query}". נסה מילות חיפוש אחרות.`,
        results: [],
      };
    }

    return {
      message: `נמצאו ${results.length} תוצאות עבור "${query}":`,
      results: results.slice(0, 5),
    };
  }
}

// ==================== AI Provider Placeholder ====================
// Ready for future AI integration (OpenAI, Anthropic, etc.)

// export class OpenAIProvider implements ChatProvider {
//   private apiKey: string;
//   private model: string;
//   private systemPrompt: string;
//
//   constructor(config: { apiKey: string; model?: string; systemPrompt?: string }) {
//     this.apiKey = config.apiKey;
//     this.model = config.model || "gpt-4";
//     this.systemPrompt = config.systemPrompt || "אתה עוזר ידע צבאי...";
//   }
//
//   async generateResponse(messages: ChatMessage[], context?: string[]): Promise<ChatResponse> {
//     // 1. Fetch relevant knowledge items for RAG context
//     // 2. Build system prompt with context
//     // 3. Call OpenAI API
//     // 4. Return response with sources
//     throw new Error("Not implemented yet");
//   }
// }

// ==================== Factory ====================

export function createChatProvider(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _aiConfig?: { provider?: string; apiKey?: string; model?: string; systemPrompt?: string; enabled: boolean } | null
): ChatProvider {
  // When AI is enabled in the future:
  // if (aiConfig?.enabled && aiConfig.provider === "openai" && aiConfig.apiKey) {
  //   return new OpenAIProvider(aiConfig);
  // }

  return new SearchOnlyProvider();
}
