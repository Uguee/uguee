
import React from 'react';
import { Link } from 'react-router-dom';

interface HeroProps {
  title: string;
  subtitle: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonLink?: string;
}

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  primaryButtonText = "Inicia tu proceso",
  secondaryButtonText = "Más información",
  primaryButtonLink = "/register",
  secondaryButtonLink = "#info",
}) => {
  return (
    <div className="relative bg-white py-12 md:py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-text">
          <span>Tu plataforma </span>
          <span className="block md:inline">de </span>
          <span className="text-primary">viajes universitarios</span>
        </h1>
        
        <p className="text-lg sm:text-xl mb-8 text-gray-600 max-w-3xl">
          {subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to={primaryButtonLink}
            className="inline-block bg-primary hover:bg-gradient-primary text-white font-medium py-3 px-6 rounded-md transition-all duration-300"
            aria-label="Comenzar el proceso de registro"
          >
            {primaryButtonText}
          </Link>
          
          <Link
            to={secondaryButtonLink}
            className="inline-block border-2 border-primary text-primary hover:bg-primary/5 font-medium py-3 px-6 rounded-md transition-all duration-300"
            aria-label="Ver más información sobre la plataforma"
          >
            {secondaryButtonText}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
