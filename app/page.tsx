"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Textarea, 
  Button, 
  Card, 
  CardBody, 
  CardHeader,
  Divider,
  addToast,
  Tabs,
  Tab
} from "@heroui/react";

import ReactMarkdown from "react-markdown";
import ApiKeyModal from "@/components/api-key-modal";

export default function HomeWithApiRoute() {
  const [message, setMessage] = useState("");
  const [replyIdea, setReplyIdea] = useState("");
  const [reply, setReply] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const lastRequestTime = useRef<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [selectedReplyStyle, setSelectedReplyStyle] = useState<string>("default");
  const [mode, setMode] = useState<string>("reply");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState<string>("");

  const COOLDOWN_MS = 3000;

  const DOING_WARMUP = false; 

  useEffect(() => {
    // Load custom API key from localStorage on component mount
    const savedApiKey = localStorage.getItem("openrouter_api_key");
    if (savedApiKey) {
      setCustomApiKey(savedApiKey);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownRemaining > 0) {
      interval = setInterval(() => {
        setCooldownRemaining(prev => Math.max(0, prev - 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  useEffect(() => {
    const warmupOpenRouter = async () => {
      if (DOING_WARMUP){
        try {
        const hasWarmedUp = localStorage.getItem("openrouter-warmed-up");
        const lastWarmup = localStorage.getItem("openrouter-last-warmup");

        const WARMUP_COOLDOWN = 3600000; // 1 hour in milliseconds
        const now = Date.now();

        if (hasWarmedUp && lastWarmup && (now - parseInt(lastWarmup)) < WARMUP_COOLDOWN) {
          return;
        }

        await fetch('/api/openrouter-warmup');
        localStorage.setItem("openrouter-warmed-up", "true");
        localStorage.setItem("openrouter-last-warmup", now.toString());
        } catch (error) {
          console.error("Failed to warm up OpenRouter API:", error);
        }
      }
    };
    warmupOpenRouter();
  }, []);

  const clearFields = () => {
    setMessage("");
    setReplyIdea("");
    setSelectedReplyStyle("");
    setReply("");
    setIsLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;

    if (timeSinceLastRequest < COOLDOWN_MS) {
      const remaining = COOLDOWN_MS - timeSinceLastRequest;
      setCooldownRemaining(remaining);
      return;
    }

    setIsLoading(true);
    lastRequestTime.current = now;

    try {
      const requestBody = { 
        message,
        selectedReplyStyle,
        mode,
        replyIdea,
        customApiKey: customApiKey || undefined, // Only send if not empty
      };

      const res = await fetch("/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const { error } = await res.json();
        if (res.status === 429) {
          throw new Error("Rate limit exceeded. Please wait before trying again.");
        }
        throw new Error(error ?? "Unknown server error");
      }

      const { reply } = await res.json();
      setReply(reply);
      
      // Auto-copy the reply to clipboard
      try {
        await navigator.clipboard.writeText(reply);
        addToast({title: "Reply copied to clipboard"})
      } catch (error) {
        console.error("Failed to copy reply to clipboard:", error);
      }
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "Unknown client error";
      setReply(`Error: ${errMsg}`);
      console.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center gap-8 py-8 md:py-10 max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl lg:text-6xl tracking-tight inline font-semibold">
          Only&nbsp;
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#FF1CF7] to-[#b249f8]">Bots</span>
        </h1>
        <h2 className="w-full my-2 text-lg lg:text-xl text-default-600 block max-w-full mt-4">
          Too lazy to reply? Use AI!
        </h2>
      </div>

      {/* Main Form Card */}
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-xl font-semibold text-default-700">
              Generate Your {mode === "reply" ? "Reply" : "Message"}
            </h3>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => setIsApiKeyModalOpen(true)}
              className="text-default-400 hover:text-default-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </Button>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="gap-6 pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <Tabs
                size="lg"
                variant="underlined"
                selectedKey={mode}
                onSelectionChange={(key) => {
                  setMode(key as string);
                }}
              >
                <Tab title="Reply" key="reply" className="text-default-600">
                </Tab>
                <Tab title="Create" key="create" className="text-default-600">
                </Tab>
              </Tabs>
            </div>

            <div>
              <Tabs
                size="sm"
                selectedKey={selectedReplyStyle}
                onSelectionChange={(key) => {
                  setSelectedReplyStyle(key as string);
                }}
              >
                <Tab title="Default" key="default" className="text-default-600">
                </Tab>
                <Tab title="Dad" key="dad" className="text-default-600">
                </Tab>
                <Tab title="Huzz"key="huzz" className="text-default-600">
                </Tab>
                <Tab title="Gravy Seal"key="gravy" className="text-default-600">
                </Tab>
              </Tabs>
            </div>

            {/* Message Input */}
            <div>
              <Textarea
              name="message"
              label={mode === "reply" ? "Their Message" : "Message"}
              placeholder={mode === "reply" ?"Enter the message you want to reply to..." : "Enter your message..."}
              value={message}
              onValueChange={setMessage}
              variant="bordered"
              minRows={4}
              maxRows={8}
              isRequired
              classNames={{
                input: "text-base",
              }}
              />
            </div>

            {mode === "reply" && (
              <div>
                <Textarea
                  name="replyIdea"
                  label="How should we reply?"
                  placeholder="Describe what you want to say. Or leave it blank."
                  value={replyIdea}
                  onValueChange={setReplyIdea}
                  variant="bordered"
                  minRows={3}
                  maxRows={5}
                  classNames={{
                    input: "text-base",
                  }}
                />
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              color="primary"
              size="lg"
              radius="lg"
              variant="shadow"
              isLoading={isLoading}
              isDisabled={!message.trim() || cooldownRemaining > 0}
              className="font-semibold"
            >
              {isLoading 
                ? `Generating ${mode === "reply" ? "Reply" : "Message"}...` 
                : cooldownRemaining > 0 
                  ? `Wait ${Math.ceil(cooldownRemaining / 1000)}s` 
                  : `Get ${mode === "reply" ? "Reply" : "Message"}`
              }
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Reply Output Card */}
      {reply && (
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="pb-2">
            <h3 className="text-xl font-semibold text-success-600">
              Generated {mode === "reply" ? "Reply" : "Message"}
            </h3>
          </CardHeader>
          <Divider />
          <CardBody className="pt-6">
            <div className="bg-default-50 p-4 rounded-lg border-l-4 border-success-500">
              <div className="text-default-700 leading-relaxed whitespace-pre-wrap">
                <ReactMarkdown
                  components={{
                    // Style the markdown elements
                    p: ({ children }) => <p className="mb-2">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold text-primary-600">{children}</strong>,
                    em: ({ children }) => <em className="italic text-secondary-600">{children}</em>,
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-semibold mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-md font-medium mb-1">{children}</h3>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    code: ({ children, node }) => 
                      node?.tagName === 'code' && Array.isArray(node?.properties?.className) && node.properties.className.some((cls) => typeof cls === 'string' && cls.includes('language-')) ? 
                        <code className="block bg-default-200 p-2 rounded text-sm font-mono">{children}</code> :
                        <code className="bg-default-200 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                    blockquote: ({ children }) => <blockquote className="border-l-2 border-default-300 pl-3 italic">{children}</blockquote>
                  }}
                >
                  {reply}
                </ReactMarkdown>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={async () => {
                  try {
                    await navigator.clipboard.writeText(reply);
                    addToast({title: "Reply copied to clipboard"});
                  } catch (error) {
                    console.error("Failed to copy reply:", error);
                  }
                }}
              >
                Copy {mode === "reply" ? "Reply" : "Message"}
              </Button>
              <Button
                size="sm"
                variant="flat"
                color="default"
                onPress={() => clearFields()}
              >
                Clear
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* API Key Settings Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onApiKeyChange={(newApiKey) => setCustomApiKey(newApiKey)}
      />
    </section>
  );
}
