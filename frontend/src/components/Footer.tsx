import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaInstagram, FaFacebook, FaTwitter, FaYoutube } from "react-icons/fa";
import { APP_CONFIG } from "@/config/constants";

const SOCIALS = [
  { Icon: FaInstagram, label: "Instagram", href: "#" },
  { Icon: FaFacebook, label: "Facebook", href: "#" },
  { Icon: FaTwitter, label: "Twitter", href: "#" },
  { Icon: FaYoutube, label: "YouTube", href: "#" },
] as const;

const NAV_COLUMNS = [
  {
    heading: "Help & Support",
    links: [
      { name: "Contact Us", href: "/contact" },
      { name: "Shipping & Delivery", href: "/shipping" },
    ],
  },
  {
    heading: "Company",
    links: [
      { name: "Testimonials", href: "/testimonials" },
      { name: "Privacy Policy", href: "/privacy" },
    ],
  },
] as const;

const CONTACT_INFO = [
  {
    Icon: MapPin,
    text: (
      <>
        410 rajhans tower , B/s krink tower mangarh chowk minibazar varachha
        <br />
        Surat Gujrat
      </>
    ),
  },
  { Icon: Phone, text: "+91 99253 47844" },
  { Icon: Mail, text: "montclairwatches7@gmail.com  " },
] as const;

function NavColumn({
  heading,
  links,
}: {
  heading: string;
  links: readonly { name: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-[10px] font-semibold uppercase tracking-widest mb-2.5 text-foreground/50">
        {heading}
      </h4>
      <ul className="space-y-0.5">
        {links.map((item) => (
          <li key={item.name}>
            <Link
              to={item.href}
              className="text-[13px] leading-6 text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all duration-200"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BrandColumn() {
  return (
    <div className="space-y-4">
      <Link to="/" className="inline-block">
        <span className="text-xl font-heading tracking-widest text-primary uppercase">
          {APP_CONFIG.APP_NAME}
        </span>
      </Link>

      <ul className="space-y-2">
        {CONTACT_INFO.map(({ Icon, text }, i) => (
          <li key={i} className="flex items-start gap-2.5 group cursor-pointer">
            <Icon className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-[13px] leading-5 text-muted-foreground group-hover:text-foreground transition-colors">
              {text}
            </p>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 pt-0.5">
        {SOCIALS.map(({ Icon, label, href }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary transition-all duration-300 group"
          >
            <Icon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 py-8 md:py-10">
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <BrandColumn />
          </div>

          {NAV_COLUMNS.map((col) => (
            <NavColumn key={col.heading} {...col} />
          ))}
        </div>

        <div className="border-t border-border py-4 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} {APP_CONFIG.APP_NAME}. All rights
            reserved.
          </p>
          <div className="flex gap-4">
            {["Privacy Policy", "Terms", "Cookies"].map((item) => (
              <Link
                key={item}
                to="#"
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
