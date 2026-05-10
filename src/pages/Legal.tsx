import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Legal = () => (
  <div className="min-h-screen">
    <Navbar />
    <main className="pt-16">
      <section className="py-20 bg-accent">
        <div className="container text-center max-w-2xl mx-auto">
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4">Legal & Privacy</h1>
          <p className="text-muted-foreground font-body">Last updated: March 2026</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-3xl space-y-12">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Privacy Policy</h2>
            <div className="space-y-3 text-muted-foreground font-body text-sm leading-relaxed">
              <p>People & Culture HUB ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website or participate in our programs.</p>
              <h3 className="font-heading text-lg font-semibold text-foreground pt-2">Information We Collect</h3>
              <p>We may collect personal information you provide directly, such as your name, email address, organization, and professional role when you sign up for events, subscribe to newsletters, or submit inquiries.</p>
              <h3 className="font-heading text-lg font-semibold text-foreground pt-2">How We Use Your Information</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>To deliver and improve our programs and services</li>
                <li>To communicate about events, workshops, and relevant resources</li>
                <li>To process meetup organizer applications</li>
                <li>To comply with legal obligations</li>
              </ul>
              <h3 className="font-heading text-lg font-semibold text-foreground pt-2">Data Protection</h3>
              <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, or destruction. We do not sell your personal information to third parties.</p>
              <h3 className="font-heading text-lg font-semibold text-foreground pt-2">Your Rights</h3>
              <p>You have the right to access, correct, or delete your personal data at any time. Contact us at privacy@peopleculturehub.org to exercise these rights.</p>
            </div>
          </div>

          <hr className="border-border" />

          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Terms of Use</h2>
            <div className="space-y-3 text-muted-foreground font-body text-sm leading-relaxed">
              <p>By accessing and using the People & Culture HUB website, you agree to the following terms and conditions.</p>
              <h3 className="font-heading text-lg font-semibold text-foreground pt-2">Use of Content</h3>
              <p>All content on this website — including text, images, guides, and toolkits — is the intellectual property of People & Culture HUB unless otherwise stated. You may not reproduce, distribute, or modify our content without written permission.</p>
              <h3 className="font-heading text-lg font-semibold text-foreground pt-2">Event Participation</h3>
              <p>By registering for or organizing events under the People & Culture HUB name, you agree to uphold our code of conduct, which promotes respectful, inclusive, and professional interactions at all times.</p>
              <h3 className="font-heading text-lg font-semibold text-foreground pt-2">Limitation of Liability</h3>
              <p>People & Culture HUB provides resources and frameworks for informational purposes. We are not liable for any actions taken based on our content. Professional legal or HR advice should be sought for specific workplace situations.</p>
            </div>
          </div>

          <hr className="border-border" />

          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Cookie Policy</h2>
            <div className="space-y-3 text-muted-foreground font-body text-sm leading-relaxed">
              <p>We use essential cookies to ensure the website functions properly. Analytics cookies are only activated with your consent and help us understand how visitors interact with the site.</p>
              <p>You can manage your cookie preferences through your browser settings at any time.</p>
            </div>
          </div>

          <div className="bg-accent rounded-xl p-6 text-center">
            <p className="text-muted-foreground font-body text-sm">Questions about our policies? Reach out at <a href="mailto:legal@peopleculturehub.org" className="text-primary hover:underline">legal@peopleculturehub.org</a></p>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Legal;
