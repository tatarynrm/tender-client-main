"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

interface LogoProps {
  width?: number;
  height?: number;
  variant?: 'light' | 'dark' | 'auto';
}

const Logo: React.FC<LogoProps> = ({ width = 140, height = 200, variant = 'auto' }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  let logoSrc = "/images/logo/logo-white.png";
  
  if (variant === 'dark') {
    logoSrc = "/images/logo/logo.png";
  } else if (variant === 'light') {
    logoSrc = "/images/logo/logo-white.png";
  } else {
    // auto
    logoSrc = theme === "dark" ? "/images/logo/logo-white.png" : "/images/logo/logo.png";
  }

  return (
    <Image
      className="cursor-pointer"
      onClick={() => router.push("/")}
      src={logoSrc}
      alt="Логотип"
      width={width}
      height={height}
      priority
    />
  );
};

export default Logo;
