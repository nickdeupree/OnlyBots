// Alternative implementation using the API route instead of server actions
// You can switch between this and the server action approach in app/page.tsx

"use client";

import { useState } from "react";
import { 
  Input, 
  Textarea, 
  Button, 
  Card, 
  CardBody, 
  CardHeader,
  Divider 
} from "@heroui/react";

import { title, subtitle } from "@/components/primitives";
import { useReplyGenerator } from "@/hooks/useReplyGenerator";

export default function HomeWithApiRoute() {
  const [message, setMessage] = useState("");
  const [replyStyle, setReplyStyle] = useState("");
  const [reply, setReply] = useState("");
  const { generateReply, isLoading } = useReplyGenerator();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const generatedReply = await generateReply(message, replyStyle);
      setReply(generatedReply);
    } catch (error) {
      console.error('Error generating reply:', error);
      setReply("Sorry, there was an error generating your reply. Please try again.");
    }
  };

  return (
    <section className="flex flex-col items-center justify-center gap-8 py-8 md:py-10 max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="text-center max-w-2xl">
        <h1 className={title({ size: "lg" })}>
          Pork&nbsp;
          <span className={title({ color: "violet", size: "lg" })}>Reply</span>
        </h1>
        <h2 className={subtitle({ class: "mt-4" })}>
          Too lazy to write replies? Let Pork reply! (API Route Version)
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
              isRequired
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
              isDisabled={!message.trim() || !replyStyle.trim()}
              className="font-semibold"
            >
              {isLoading ? "Generating Reply..." : "Get Smart Reply"}
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
              <p className="text-default-700 leading-relaxed whitespace-pre-wrap">
                {reply}
              </p>
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
                onPress={() => setReply("")}
              >
                Clear
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mt-8">
        <Card className="shadow-sm">
          <CardBody className="text-center p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-600 text-xl">🎯</span>
            </div>
            <h4 className="font-semibold text-default-700 mb-2">Contextual</h4>
            <p className="text-sm text-default-500">
              Replies are tailored to your specific message and context
            </p>
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardBody className="text-center p-6">
            <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-secondary-600 text-xl">✨</span>
            </div>
            <h4 className="font-semibold text-default-700 mb-2">Customizable</h4>
            <p className="text-sm text-default-500">
              Choose your preferred tone, style, and approach
            </p>
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardBody className="text-center p-6">
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-success-600 text-xl">⚡</span>
            </div>
            <h4 className="font-semibold text-default-700 mb-2">Instant</h4>
            <p className="text-sm text-default-500">
              Get intelligent replies in seconds
            </p>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
