import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";
import Link from "next/link";
import React, { PropsWithChildren } from "react";
import AuthSocial from "./AuthSocial";

interface AuthWrapperProps {
  heading: string;
  description?: string;
  backButtonLabel?: string;
  backButtonHref?: string;
  isShowSocial?: boolean;
  isFullSize?: boolean;
}
const AuthWrapper = ({
  children,
  heading,
  description,
  backButtonHref,
  backButtonLabel,
  isShowSocial,
  isFullSize,
}: PropsWithChildren<AuthWrapperProps>) => {
  return (
    <Card className={`${isFullSize ? "w-full" : "w-[400px] max-w-full"} relative bg-white border border-slate-100 rounded-[32px] p-2 md:p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <CardHeader className="space-y-3 mb-2">
        <CardTitle className="font-sans font-bold text-[28px] md:text-[32px] text-[#0a2540] tracking-[-0.02em]">{heading}</CardTitle>
        {description && <CardDescription className="font-sans font-normal text-[15px] text-[#3d6080] leading-[1.6]">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {/* {isShowSocial && <AuthSocial/>} */}
        {children}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        {backButtonLabel && backButtonHref && (
          <Button variant={"link"} className="w-full font-normal text-[#4256D5] hover:text-[#3143b5]">
            <Link href={backButtonHref}>{backButtonLabel}</Link>
          </Button>
        )}
        <div className="w-full text-center text-[11px] text-slate-400 leading-relaxed">
          <Link href="/terms" target="_blank" className="hover:text-[#4256D5] hover:underline">
            Угода користувача
          </Link>
          <span className="mx-1.5">·</span>
          <Link href="/privacy" target="_blank" className="hover:text-[#4256D5] hover:underline">
            Політика конфіденційності
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AuthWrapper;
