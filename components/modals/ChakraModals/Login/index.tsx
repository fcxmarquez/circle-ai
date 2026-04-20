import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FiLogIn } from "react-icons/fi";

export const ModalLogin = () => {
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const router = useRouter();

  const handleLogin = () => {
    router.push("/auth/login");
  };

  // Prevent closing the modal by clicking outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Authentication Required</ModalHeader>
        <ModalCloseButton disabled />
        <ModalBody pb={6}>
          <Alert
            status="info"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="auto"
            className="rounded-lg"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Login Required
            </AlertTitle>
            <AlertDescription maxWidth="sm" mb={4}>
              You need to be logged in to use Circle. Please click the button below to
              proceed to the login page.
            </AlertDescription>
            <Button
              leftIcon={<FiLogIn />}
              colorScheme="purple"
              onClick={handleLogin}
              mb={4}
            >
              Go to Login
            </Button>
          </Alert>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
