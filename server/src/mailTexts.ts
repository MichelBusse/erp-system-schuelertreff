export const passwordResetMail = (link: string) => {
  return (
    `Liebes Schülertreff-Mitglied,\n\nmit dem folgenden Link kannst du ein neues Passwort für deinen Account festlegen:\n\nLink:\n${link}\n\n` +
    contactSignature
  )
}

export const registrationMailText = (link: string) => {
  return (
    `Liebes Schülertreff-Mitglied,\n\nnoch einmal möchten wir dich in unserem Team willkommen heißen.\n\nDamit auch du nun bald mit deinen Einsätzen bei uns starten kannst, erhältst du in dieser Mail einen Link zugesendet. Klicke auf diesen und lege dein neues Passwort fest. Danach kannst du diese Mail, sowie dein neu festgelegtes Passwort für den LogIn verwenden.\nBitte beachte, dass dieser Passwort-Reset-Link nur eine Woche gültig ist.\n\nLink:\n${link}\n\nNach dem ersten LogIn bitten wir dich darum alle wichtigen Daten anzugeben, diese werden für unsere Vertragserstellung benötigt.\nSobald alles eingefügt ist, erstellen wir deinen Vertrag, sowie dein Antrag für ein Erweitertes Führungszeugnis. Beides kannst du dann herunterladen. Solltest du bereits im Besitz des Erweiterten Führungszeugnisses sein, so kannst du dieses direkt hochladen.\n\nSobald du diese Schritte befolgt hast, können wir starten und du erhälst deine ersten Einsätze.\nBei Fragen kannst du uns selbstverständlich unter den folgenden Kontaktdaten erreichen:\n\n` +
    contactSignature
  )
}

export const applicationMeetingProposalMail = (
  name: string,
  link: string,
  formattedDates: string[],
) => {
  return (
    `Sehr geehrte/r ${name},\n\ndas Team von Schülertreff bedankt sich für Ihr Interesse an unserer Stellenausschreibung.\nGern würden wir Sie im persönlichen Gespräch kennenlernen.\n\nBitte bestätigen Sie einen dieser Termine:\n\n${formattedDates.reduce(
      (prevVal, currentVal) => prevVal + '\n' + currentVal,
    )}\nDas Meeting würde online über Zoom stattfinden.\nMeeting-Link:\n${link}\n\nMeeting-ID: 737 0707 8960\nKenncode: qMwjR9\n\nSollten Sie bereits zu diesen Zeiten verplant sein, bitten wir um einen Terminvorschlag Ihrerseits.\n\nBei Interesse können Sie uns auch gerne auf unserer Internetseite www.schuelertreff-nachhilfe.de besuchen.\n\nWir hoffen auf eine gute zukünftige  Zusammenarbeit, welche im Sinne unserer Schülerinnen und Schüler liegen soll.\n\nBei Fragen stehen wir Ihnen gern unter den angegebenen Kontaktdaten zur Verfügung.\n\n` +
    contactSignature
  )
}

export const applicationMeetingSetDateMail = (
  name: string,
  link: string,
  formattedDate: string,
) => {
  return (
    `Sehr geehrte/r ${name},\n\nwie mit Ihnen telefonisch besprochen, bestätige ich mit dieser E-Mail folgenden Termin.\n\nTermin:\n${formattedDate}\n\nDas Meeting würde online über Zoom stattfinden.\nMeeting-Link:\n${link}\n\nMeeting-ID: 737 0707 8960\nKenncode: qMwjR9\n\nBei Interesse können Sie uns auch gerne auf unserer Internetseite www.schuelertreff-nachhilfe.de besuchen.\n\nWir hoffen auf eine gute zukünftige Zusammenarbeit, welche im Sinne unserer Schülerinnen und Schüler liegen soll.\n\nBei Fragen stehen wir Ihnen gern unter den angegebenen Kontaktdaten zur Verfügung.\n\n` +
    contactSignature
  )
}

export const employmentMail = (name: string) => {
  return (
    `Sehr geehrte/r ${name},\n\nwir bedanken uns herzlich für Ihre Bewerbung, den damit verbundenen Mühen sowie Ihrem Interesse an unserem Unternehmen.\n\nAus unserer Bewerberauswahl haben Sie uns mit Ihren Fähigkeiten und Ihrem Auftreten überzeugt. Wir freuen uns, Ihnen mitteilen zu können, dass wir mit Ihnen gerne zusammenarbeiten möchten.\n\nWir können Ihnen somit, wie bereits besprochen,  eine Stelle auf Honorarbasis anbieten. Der Stundenumfang ist dabei flexibel anpassbar.\nIhre Aufgaben werden darin bestehen, Kinder selbst zu unterrichten und Lehrer während der offiziellen Unterrichtszeit zu unterstützen.\nBitte geben Sie uns in den nächsten Tagen eine Rückmeldung, bezüglich Ihrer Entscheidung.\n\nHerzlich Willkommen in unserem Team!\n\nBei Interesse können Sie uns auch gerne auf unserer Internetseite www.schuelertreff-nachhilfe.de besuchen.\n\nWir hoffen auf eine zukünftige Zusammenarbeit, welche im Sinne unserer Schülerinnen und Schüler liegen soll.\n\nBei Fragen stehen wir Ihnen gern unter den angegebenen Kontaktdaten zur Verfügung.\n\n` +
    contactSignature
  )
}

const contactSignature = `Unsere Kontaktdaten:\n\n
0176/60912238 (Marek Pijala)\n
0176/22079244 (Nikita Soldatov)\n
info@schuelertreff-nachhilfe.de\n
www.schuelertreff-nachhilfe.de\n\n
Liebe Grüße,\n
Dein Schülertreff-Team`
