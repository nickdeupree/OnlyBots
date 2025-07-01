"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Textarea, 
  Button, 
  Card, 
  CardBody, 
  CardHeader,
  Divider 
} from "@heroui/react";

import ReactMarkdown from "react-markdown";

import { title, subtitle } from "@/components/primitives";

export default function HomeWithApiRoute() {
  const [message, setMessage] = useState("");
  const [replyStyle, setReplyStyle] = useState("");
  const [reply, setReply] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const lastRequestTime = useRef<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const COOLDOWN_MS = 3000;

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
      try {
        await fetch('/api/openrouter-warmup');
      } catch (error) {
        console.error("Failed to warm up OpenRouter API:", error);
      }
    };
    warmupOpenRouter();
  }, []);

  const clearFields = () => {
    setMessage("");
    setReplyStyle("");
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
      const res = await fetch("/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, replyStyle }),
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
        <h1 className={title({ size: "lg" })}>
          Only&nbsp;
          <span className={title({ color: "violet", size: "lg" })}>Bots</span>
        </h1>
        <h2 className={subtitle({ class: "mt-4" })}>
          Too lazy to write replies? Let Pork reply!
        </h2>
      </div>

      {/* Main Form Card */}
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="pb-2">
          <h3 className="text-xl font-semibold text-default-700">
            Generate Your Reply
          </h3>
        </CardHeader>
        <Divider />
        <CardBody className="gap-6 pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Textarea
              name="message"
              label="Their Message"
              placeholder="Enter the message you want to reply to..."
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

            {/* Reply Style Input */}
            <Textarea
              name="replyStyle"
              label="How should we reply?"
              placeholder="Describe what you want to say. Or leave it blank."
              value={replyStyle}
              onValueChange={setReplyStyle}
              variant="bordered"
              minRows={3}
              maxRows={5}
              classNames={{
                input: "text-base",
              }}
            />

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
                ? "Generating Reply..." 
                : cooldownRemaining > 0 
                  ? `Wait ${Math.ceil(cooldownRemaining / 1000)}s` 
                  : "Get Smart Reply"
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
              Generated Reply
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
                onPress={() => {
                  navigator.clipboard.writeText(reply);
                }}
              >
                Copy Reply
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
    </section>
  );
}
