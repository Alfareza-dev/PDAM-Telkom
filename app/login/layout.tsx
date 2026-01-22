export const metadata = {
  title: "Login | PDAM",
  description: "PDAM LOGIN ADMIN",
};

type PropsLayout = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: PropsLayout) => {
  return <div>{children}</div>;
};

export default RootLayout;
