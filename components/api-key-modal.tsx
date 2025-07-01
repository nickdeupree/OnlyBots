"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Link,
  Card,
  CardBody,
} from "@heroui/react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeyChange: (apiKey: string) => void;
}

export default function ApiKeyModal({
  isOpen,
  onClose,
  onApiKeyChange,
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [hasCustomKey, setHasCustomKey] = useState(false);

  useEffect(() => {
    // Load saved API key from localStorage
    const savedApiKey = localStorage.getItem("openrouter_api_key");

    if (savedApiKey) {
      setApiKey(savedApiKey);
      setHasCustomKey(true);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      // Save to localStorage
      localStorage.setItem("openrouter_api_key", apiKey.trim());
      onApiKeyChange(apiKey.trim());
      setHasCustomKey(true);
    } else {
      // Remove from localStorage if empty
      localStorage.removeItem("openrouter_api_key");
      onApiKeyChange("");
      setHasCustomKey(false);
    }
    onClose();
  };

  const handleClear = () => {
    setApiKey("");
    localStorage.removeItem("openrouter_api_key");
    onApiKeyChange("");
    setHasCustomKey(false);
  };

  return (
    <Modal isOpen={isOpen} placement="center" size="lg" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold">API Key Settings</h3>
          <p className="text-sm text-default-500">
            Configure your OpenRouter API key for unlimited usage
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200">
              <CardBody className="gap-2">
                <h4 className="font-semibold text-primary-700">
                  Why use your own API key?
                </h4>
                <ul className="text-sm text-default-600 space-y-1">
                  <li>
                    • <strong>Shared key:</strong> 50 responses per day limit
                    (shared among all users)
                  </li>
                  <li>
                    • <strong>Your key:</strong> Your own usage limits and
                    better reliability
                  </li>
                  <li>
                    • <strong>Cost:</strong> Very affordable - most models cost
                    fractions of a penny
                  </li>
                </ul>
              </CardBody>
            </Card>

            <div className="flex flex-col gap-2">
              <Input
                description="Leave blank to use the shared API key"
                endContent={
                  hasCustomKey && apiKey ? (
                    <Button
                      className="text-xs"
                      color="danger"
                      size="sm"
                      variant="light"
                      onPress={handleClear}
                    >
                      Clear
                    </Button>
                  ) : null
                }
                label="OpenRouter API Key"
                placeholder="sk-or-..."
                type="password"
                value={apiKey}
                variant="bordered"
                onValueChange={setApiKey}
              />
              <div className="text-sm text-default-500">
                Don&apos;t have an API key?{" "}
                <Link
                  className="text-primary-600 hover:text-primary-700"
                  href="https://openrouter.ai/settings/keys"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Create one here →
                </Link>
              </div>
            </div>

            <Card className="bg-warning-50 border border-warning-200">
              <CardBody className="gap-2">
                <h4 className="font-semibold text-warning-700 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      fillRule="evenodd"
                    />
                  </svg>
                  Security Note
                </h4>
                <p className="text-sm text-warning-700">
                  Your API key is stored locally in your browser and sent
                  securely to OpenRouter. It&apos;s never stored on our servers.
                </p>
              </CardBody>
            </Card>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSave}>
            Save Settings
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
