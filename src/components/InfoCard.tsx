
import React from 'react';
import { Link } from 'react-router-dom';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  linkText?: string;
  linkUrl?: string;
  icon?: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  children,
  linkText,
  linkUrl,
  icon
}) => {
  return (
    <div className="border-2 border-dashed border-secondary rounded-lg p-5 h-full">
      <div className="flex flex-col h-full">
        <h3 className="text-lg font-semibold mb-3 text-text">
          {title}
        </h3>
        
        <div className="flex-grow mb-4">
          {children}
        </div>
        
        {linkText && linkUrl && (
          <div className="mt-auto">
            <Link
              to={linkUrl}
              className="inline-flex items-center bg-primary hover:bg-primary-hover text-white rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200"
            >
              {linkText} {icon && <span className="ml-2">{icon}</span>}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoCard;
