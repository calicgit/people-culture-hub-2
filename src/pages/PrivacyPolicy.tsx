import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import { useLanguage } from "@/contexts/LanguageContext";

const PrivacyPolicy = () => {
  const { t } = useLanguage();

  const sections: { title: string; paragraphs: string[] }[] = [
    {
      title: t("Tko smo mi", "Who we are"),
      paragraphs: [
        t(
          'Adresa naše web stranice je: <a href="/" class="text-primary hover:underline">hub.peopleandculture.hr</a>',
          'Our website address is: <a href="/" class="text-primary hover:underline">hub.peopleandculture.hr</a>'
        ),
      ],
    },
    {
      title: t("Komentari", "Comments"),
      paragraphs: [
        t(
          "Kada posjetitelji ostave komentare na web mjestu, prikupljamo podatke prikazane u obrascu za komentare, kao i IP adresu posjetitelja i niz korisničkog agenta preglednika kako bismo pomogli u otkrivanju neželjene pošte.",
          "When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor's IP address and browser user agent string to help spam detection."
        ),
        t(
          'Anonimizirani niz stvoren iz vaše adrese e-pošte (koji se naziva i hash) može se dostaviti usluzi Gravatar kako bi se vidjelo koristite li ga. Pravila o privatnosti usluge Gravatar dostupna su ovdje: <a href="https://automattic.com/privacy/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">https://automattic.com/privacy/</a>. Nakon odobrenja vašeg komentara, vaša profilna slika vidljiva je javnosti u kontekstu vašeg komentara.',
          'An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. The Gravatar service privacy policy is available here: <a href="https://automattic.com/privacy/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">https://automattic.com/privacy/</a>. After approval of your comment, your profile picture is visible to the public in the context of your comment.'
        ),
      ],
    },
    {
      title: t("Sadržaj", "Media"),
      paragraphs: [
        t(
          'Ako prenosite slike na web stranicu, trebali biste izbjegavati učitavanje slika s ugrađenim podacima o lokaciji (EXIF GPS). Posjetitelji web stranice mogu preuzeti i izdvojiti sve podatke o lokaciji sa slika na web stranici uz eksplicitno dopuštenje autoriteta nadležnog za navedenu stranicu. Za više informacija molimo Vas da se obratite na <a href="mailto:hub@peopleandculture.hr" class="text-primary hover:underline">hub@peopleandculture.hr</a>.',
          'If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images on the website with the explicit permission of the authority in charge of the said page. For more information please contact us at <a href="mailto:hub@peopleandculture.hr" class="text-primary hover:underline">hub@peopleandculture.hr</a>.'
        ),
      ],
    },
    {
      title: t("Kolačići", "Cookies"),
      paragraphs: [
        t(
          "Ako ostavite komentar na našoj web stranici, možete se odlučiti za spremanje svog imena, adrese e-pošte i web stranice u kolačiće. Ovo je za vašu udobnost kako ne biste morali ponovno ispunjavati svoje podatke kada ostavite drugi komentar. Ovi kolačići će trajati godinu dana.",
          "If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year."
        ),
        t(
          "Ako posjetite našu stranicu za prijavu, postavit ćemo privremeni kolačić kako bismo utvrdili prihvaća li vaš preglednik kolačiće. Ovaj kolačić ne sadrži osobne podatke i odbacuje se kada zatvorite preglednik.",
          "If you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser."
        ),
        t(
          'Ako se prijavite, također ćemo postaviti nekoliko kolačića za spremanje vaših podataka za prijavu i izbora prikaza zaslona. Kolačići za prijavu traju dva dana, a kolačići s opcijama zaslona godinu dana. Ako odaberete "Zapamti me", vaša će prijava trajati dva tjedna. Ako se odjavite sa svog računa, kolačići za prijavu bit će uklonjeni.',
          'When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select "Remember Me", your login will persist for two weeks. If you log out of your account, the login cookies will be removed.'
        ),
        t(
          "Ako uredite ili objavite članak, dodatni kolačić bit će spremljen u vaš preglednik. Ovaj kolačić ne sadrži osobne podatke i jednostavno označava ID objave članka koji ste upravo uredili. Istječe nakon 1 dana.",
          "If you edit or publish an article, an additional cookie will be saved in your browser. This cookie includes no personal data and simply indicates the post ID of the article you just edited. It expires after 1 day."
        ),
      ],
    },
    {
      title: t("Ugrađeni sadržaj s drugih web stranica", "Embedded content from other websites"),
      paragraphs: [
        t(
          "Članci na ovoj stranici mogu sadržavati ugrađeni sadržaj (npr. videozapise, slike, članke itd.). Ugrađeni sadržaj s drugih web stranica ponaša se na potpuno isti način kao da je posjetitelj posjetio drugu web stranicu.",
          "Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website."
        ),
        t(
          "Te web stranice mogu prikupljati podatke o vama, koristiti kolačiće, ugrađivati dodatno praćenje trećih strana i nadzirati vašu interakciju s tim ugrađenim sadržajem, uključujući praćenje vaše interakcije s ugrađenim sadržajem ako imate račun i prijavljeni ste na tu web stranicu.",
          "These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content, including tracking your interaction with the embedded content if you have an account and are logged in to that website."
        ),
      ],
    },
    {
      title: t("S kim dijelimo vaše podatke", "Who we share your data with"),
      paragraphs: [
        t(
          "Ako zatražite ponovno postavljanje lozinke, vaša IP adresa bit će uključena u e-poštu za ponovno postavljanje.",
          "If you request a password reset, your IP address will be included in the reset email."
        ),
      ],
    },
    {
      title: t("Koliko dugo zadržavamo vaše podatke", "How long we retain your data"),
      paragraphs: [
        t(
          "Ako ostavite komentar, komentar i njegovi metapodaci zadržavaju se na neodređeno vrijeme. To je tako da možemo automatski prepoznati i odobriti sve naknadne komentare umjesto da ih držimo u redu za moderiranje.",
          "If you leave a comment, the comment and its metadata are retained indefinitely. This is so we can recognize and approve any follow-up comments automatically instead of holding them in a moderation queue."
        ),
        t(
          "Za korisnike koji se registriraju na našoj web stranici (ako postoje), također pohranjujemo osobne podatke koje daju u svom korisničkom profilu. Svi korisnici mogu vidjeti, urediti ili izbrisati svoje osobne podatke u bilo kojem trenutku (osim što ne mogu promijeniti svoje korisničko ime). Administratori web-mjesta također mogu vidjeti i uređivati te podatke.",
          "For users that register on our website (if any), we also store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time (except they cannot change their username). Website administrators can also see and edit that information."
        ),
      ],
    },
    {
      title: t("Koja prava imate nad svojim podacima", "What rights you have over your data"),
      paragraphs: [
        t(
          "Ako imate račun na ovoj stranici ili ste ostavili komentare, možete zatražiti primanje izvezene datoteke osobnih podataka koje imamo o vama, uključujući sve podatke koje ste nam dali. Također možete zatražiti da izbrišemo sve osobne podatke koje imamo o vama. To ne uključuje podatke koje smo dužni čuvati u administrativne, pravne ili sigurnosne svrhe.",
          "If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes."
        ),
      ],
    },
    {
      title: t("Gdje se šalju vaši podaci", "Where your data is sent"),
      paragraphs: [
        t(
          "Komentari posjetitelja mogu se provjeriti putem automatizirane usluge otkrivanja neželjene pošte.",
          "Visitor comments may be checked through an automated spam detection service."
        ),
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar forceSolid />
      <main className="flex-1 pt-20">
        <section className="py-16">
          <div className="container max-w-3xl space-y-10">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              {t("Politika privatnosti", "Privacy Policy")}
            </h1>

            <div className="space-y-8 text-muted-foreground font-body text-sm leading-relaxed">
              {sections.map((section, idx) => (
                <div key={idx}>
                  <h2 className="font-heading text-xl font-bold text-foreground mb-3">
                    {section.title}
                  </h2>
                  {section.paragraphs.map((p, i) => (
                    <p
                      key={i}
                      className={i > 0 ? "mt-3" : ""}
                      dangerouslySetInnerHTML={{ __html: p }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
};

export default PrivacyPolicy;
