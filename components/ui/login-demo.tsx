import { Login1 } from "@/components/ui/login-1";

const DemoOne = () => {
  return (
    <Login1 
      heading="Welcome to AICBOLT"
      logo={{
        url: "/",
        src: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=50&fit=crop&crop=center",
        alt: "AICBOLT Logo",
        title: "AICBOLT",
      }}
      buttonText="Sign In"
      googleText="Continue with Google"
      signupText="Don't have an account?"
      signupUrl="/sign-up"
    />
  );
};

export { DemoOne };
