export const passwordResetMail = (link: string) => {
  return (
    `Liebes Schülertreff-Mitglied,\n\n
  mit dem folgenden Link kannst du ein neues Passwort für deinen Account festlegen:\n\n
  Link:\n
  ${link}\n\n` + contactSignature
  )
}

export const registrationMailText = (link: string) => {
  return (
    `Liebes Schülertreff-Mitglied,\n\n
  noch einmal möchten wir dich in unserem Team willkommen heißen.\n\n
  Damit auch du nun bald mit deinen Einsätzen bei uns starten kannst, erhältst du in dieser Mail einen Link zugesendet. Klicke auf diesen und lege dein neues Passwort fest. Danach kannst du diese Mail, sowie dein neu festgelegtes Passwort für den LogIn verwenden.\n\n
  Link:\n 
  ${link}\n\n
  Nach dem ersten LogIn bitten wir dich darum alle wichtigen Daten anzugeben, diese werden für unsere Vertragserstellung benötigt.\n
  Sobald alles eingefügt ist, erstellen wir deinen Vertrag, sowie dein Antrag für ein Erweitertes Führungszeugnis. Beides kannst du dann herunterladen. Solltest du bereits im Besitz des Erweiterten Führungszeugnisses sein, so kannst du dieses direkt hochladen.\n\n 
  Sobald du diese Schritte befolgt hast, können wir starten und du erhälst deine ersten Einsätze. \n Bei Fragen kannst du uns selbstverständlich unter den folgenden Kontaktdaten erreichen:\n\n` +
    contactSignature
  )
}

export const applicationMeetingProposalMail = (
  name: string,
  link: string,
  formattedDates: string[],
) => {
  return (
    `Sehr geehrte/r ${name},\n\n
  das Team von Schülertreff bedankt sich für Ihr Interesse an unserer Stellenausschreibung.\n 
  Gern würden wir Sie im persönlichen Gespräch kennenlernen.\n\n
  Bitte bestätigen Sie einen dieser Termine:\n\n
  ${formattedDates.reduce(
    (prevVal, currentVal) => prevVal + '\n' + currentVal,
  )}\n
  Das Meeting würde online über Zoom stattfinden.\n
  Meeting-Link:\n
  ${link}\n\n
  Meeting-ID: 737 0707 8960\n
  Kenncode: qMwjR9\n\n
  Sollten Sie bereits zu diesen Zeiten verplant sein, bitten wir um einen Terminvorschlag Ihrerseits.\n\n
  Bei Interesse können Sie uns auch gerne auf unserer Internetseite www.schuelertreff-nachhilfe.de besuchen.\n\n 
  Wir hoffen auf eine gute zukünftige  Zusammenarbeit, welche im Sinne unserer Schülerinnen und Schüler liegen soll.\n\n
  Bei Fragen stehen wir Ihnen gern unter den angegebenen Kontaktdaten zur Verfügung.\n\n` +
    contactSignature
  )
}

export const applicationMeetingSetDateMail = (
  name: string,
  link: string,
  formattedDate: string,
) => {
  return (
    `Sehr geehrte/r ${name},\n\n
  wie mit Ihnen telefonisch besprochen, bestätige ich mit dieser E-Mail folgenden Termin.\n\n
  Termin:\n
  ${formattedDate}\n\n
  Das Meeting würde online über Zoom stattfinden.\n
  Meeting-Link:\n
  ${link}\n\n
  Meeting-ID: 737 0707 8960\n
  Kenncode: qMwjR9\n\n
  Bei Interesse können Sie uns auch gerne auf unserer Internetseite www.schuelertreff-nachhilfe.de besuchen.\n\n
  Wir hoffen auf eine gute zukünftige Zusammenarbeit, welche im Sinne unserer Schülerinnen und Schüler liegen soll.\n\n  
  Bei Fragen stehen wir Ihnen gern unter den angegebenen Kontaktdaten zur Verfügung.\n\n` +
    contactSignature
  )
}

export const employmentMail = (name: string) => {
  return (
    `Sehr geehrte/r ${name},\n\n
  wir bedanken uns herzlich für Ihre Bewerbung, den damit verbundenen Mühen sowie Ihrem Interesse an unserem Unternehmen.\n\n
  Aus unserer Bewerberauswahl haben Sie uns mit Ihren Fähigkeiten und Ihrem Auftreten überzeugt. Wir freuen uns, Ihnen mitteilen zu können, dass wir mit Ihnen gerne zusammenarbeiten möchten.\n\n
  Wir können Ihnen somit, wie bereits besprochen,  eine Stelle auf Honorarbasis anbieten. Der Stundenumfang ist dabei flexibel anpassbar.\n
  Ihre Aufgaben werden darin bestehen, Kinder selbst zu unterrichten und Lehrer während der offiziellen Unterrichtszeit zu unterstützen.\n
  Bitte geben Sie uns in den nächsten Tagen eine Rückmeldung, bezüglich Ihrer Entscheidung.\n\n
  Herzlich Willkommen in unserem Team!\n\n
  Bei Interesse können Sie uns auch gerne auf unserer Internetseite www.schuelertreff-nachhilfe.de besuchen.\n\n
  Wir hoffen auf eine zukünftige Zusammenarbeit, welche im Sinne unserer Schülerinnen und Schüler liegen soll.\n\n
  Bei Fragen stehen wir Ihnen gern unter den angegebenen Kontaktdaten zur Verfügung.\n\n` +
    contactSignature
  )
}

const contactSignature = `Unsere Kontaktdaten:\n\n
0176/60912238 (Marek Pijala)\n
0176/22079244 (Nikita Soldatov)\n 
info@schuelertreff-nachhilfe.de\n
www.schuelertreff-nachhilfe.de\n\n
Liebe Grüßen\n
Dein Schülertreff-Team`
