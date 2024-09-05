import imgLogo from '../assets/img/bannerCompras.png'

const WhatsAppButton = () => {
  return (
    <a
      href="/products" // Reemplaza con tu número de WhatsApp
      className="fixed bottom-4 right-2    transition duration-300 transform hover:scale-100 hover:animate-bounce z-50 md:bottom-8 md:right-6"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img src={imgLogo} className="w-24 h-24 md:w-48 md:h-48"  />
    </a>
  );
}

export default WhatsAppButton;
//