
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div>
            <h2 className="text-primary text-xl font-bold">Ugüee</h2>
            <p className="mt-2 text-sm text-gray-600">
              Tu plataforma de viajes universitarios: planifica, comparte y viaja de forma inteligente.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-3">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 text-sm hover:text-primary transition-colors">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 text-sm hover:text-primary transition-colors">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 text-sm hover:text-primary transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-600 text-sm hover:text-primary transition-colors">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 text-sm hover:text-primary transition-colors">
                  Términos y condiciones
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Ugüee. Todos los derechos reservados.
          </p>
          
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-500">
              Respaldado por las mejores universidades
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
