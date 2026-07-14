import { CsvPlaceRow } from '@/types';

export function buildPlaceContentPrompt(data: CsvPlaceRow, transportInfo: Record<string, unknown>): string {
  return `Write a helpful, factual, and SEO-friendly article about the place of worship below. Use Markdown with clear ## section headings and ### subheadings. Use bullet lists where appropriate. Do not use em-dashes or en-dashes; use regular hyphens (-) instead. Organize the content by the topics listed below, using one or more natural paragraphs per topic. Do NOT write a title heading and do NOT include any introduction, preamble, or meta commentary like "Here is the article" or "This article is designed for...". Be warm but concise. Do not invent specific historical dates unless they are in the provided data. If data is missing, write in general terms. Avoid long dashes and overly flowery or robotic sounding phrases. Use simple language and short paragraphs.

Place Name: ${data.name}
Description: ${data.description || 'N/A'}
Address: ${data.address || 'N/A'}
City: ${data.city}, State: ${data.state}, ZIP: ${data.zip || 'N/A'}
Religion: ${data.religion}
Denomination: ${data.denomination || 'N/A'}
Phone: ${data.phone || 'N/A'}
Website: ${data.website || 'N/A'}
Email: ${data.email || 'N/A'}
Languages: ${data.language || 'N/A'}
Facilities: ${data.facilities || 'N/A'}
Schedule Notes: ${data.schedule_notes || 'N/A'}
Nearby Transportation: ${JSON.stringify(transportInfo)}

Please include the following sections:
1. About [Name] - history, atmosphere, architecture.
2. Access & Transportation - nearest transit stations, parking, walking/driving directions.
3. Regular Worship Schedule - prayer times, service times, etc.
4. Language & Community - languages spoken, dominant community.
5. Facilities - amenities available.
6. Visitor Tips - advice for first-time visitors.
7. Community Events & Activities.
8. Contact Information.

The final article must be at least 1,500 words. If the first draft is shorter, expand sections 1, 6, and 7 with additional helpful detail. Return only the article; do not include meta commentary such as "Here is the article".`;
}

function formatSchedule(schedule?: string): string {
  if (!schedule) return '';
  try {
    const parsed = JSON.parse(schedule);
    if (parsed && typeof parsed === 'object') {
      const entries = Object.entries(parsed)
        .filter(([key]) => key !== 'status')
        .map(([day, hours]) => `- ${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}`);
      if (entries.length) return entries.join('\n');
    }
  } catch {}
  return schedule;
}

export function buildFallbackContent(data: CsvPlaceRow, transportInfo: Record<string, unknown>): string {
  const schedule = formatSchedule(data.schedule_notes);
  const stations = (transportInfo?.nearestStations as string[])?.join(', ') || 'nearby transit options';
  const facilities = data.facilities || 'comfortable prayer areas, restrooms, and community spaces';
  const language = data.language || 'English';
  const phone = data.phone || 'the contact number listed on their website';
  const email = data.email || 'their official email address';
  const website = data.website || 'their official website';
  const address = data.address || `${data.city}, ${data.state}`;

  const sections = [
    `## About ${data.name}`,
    `Located at ${address} in ${data.city}, ${data.state}, **${data.name}** is a welcoming place of worship serving the local ${data.religion} community. Whether you are a long-time resident, a newcomer, or just passing through, this congregation invites you to join them for worship, fellowship, and spiritual growth.`,
    data.description ? `\n${data.description}\n` : '',
    `The community here values hospitality, learning, and service. Many visitors describe the atmosphere as warm and inclusive, with programs designed for families, youth, and seniors alike. The leadership team is committed to preserving traditions while embracing newcomers, ensuring that everyone feels at home.`,
    `While specific historical details about ${data.name} are not available in our records, the congregation carries forward the enduring traditions of the ${data.religion} faith. Places of worship like this one often begin with a small group of devoted individuals who seek to create a spiritual home for their neighbors. Over time, that vision grows into a vibrant community where faith is lived out through worship, education, and acts of service.`,
    `The atmosphere at ${data.name} is best described as welcoming and community-oriented. Visitors are greeted with open hearts and are encouraged to participate at their own pace. The worship style reflects the customs of the ${data.religion} tradition, blending reverence with warmth. Sermons and teachings aim to be practical and rooted in faith, offering guidance for everyday life.`,
    `The building itself is designed to support both worship and fellowship. While architectural details may vary, you can typically expect a comfortable sanctuary, gathering spaces for before and after services, and areas for children and youth. The facility strives to be accessible and welcoming to people of all ages and abilities.`,

    `## Access & Transportation`,
    `Getting to ${data.name} is straightforward. The congregation is located in ${data.city}, ${data.state}, and is accessible by car, public transit, bicycle, or on foot depending on where you are coming from.`,
    `If you are driving, parking is generally available near the building. We recommend arriving a few minutes early, especially during major services or events, to find a convenient space. For turn-by-turn directions, use the address with your preferred maps application or click the "Directions" button on this page.`,
    `For those using public transportation, nearby options include ${stations}. Transit schedules can change, so it is a good idea to check the latest routes and times before your visit. If you live nearby, walking or biking can also be pleasant options, depending on local sidewalks and bike lanes.`,

    `## Regular Worship Schedule`,
    schedule
      ? `Services and gatherings at ${data.name} follow a regular weekly schedule:\n\n${schedule}\n\nPlease keep in mind that special services, holidays, and community events may adjust these times. When in doubt, contact the congregation directly to confirm the current schedule.`
      : `The regular schedule at ${data.name} follows the traditions of the ${data.religion} faith. Please contact the place of worship or visit ${website} for the most up-to-date service times.`,
    `Many congregations offer Sunday worship as the cornerstone of their week, often accompanied by midweek prayer meetings, Bible studies, or youth gatherings. These additional gatherings provide opportunities for deeper connection and spiritual growth.`,

    `## Language & Community`,
    `Services and programs at ${data.name} are offered in ${language}. The community reflects the diverse backgrounds of ${data.city}, creating a rich cultural and spiritual experience where people from many walks of life can come together.`,
    `The congregation welcomes individuals and families at every stage of life. Whether you are seeking a new faith community, visiting from out of town, or reconnecting with your spiritual roots, you will find a supportive environment here. The dominant culture is one of fellowship, respect, and shared commitment to faith and service.`,

    `## Facilities`,
    `Visitors to ${data.name} can benefit from the following facilities: ${facilities}. The venue strives to be accessible to people of all abilities, and accessible entrances, parking, and restrooms are typically available.`,
    `In addition to the sanctuary, the facility may include fellowship halls, classrooms, meeting rooms, and outdoor spaces. These areas support a wide range of activities, from worship services and educational programs to social gatherings and community outreach.`,

    `## Visitor Tips`,
    `If this is your first visit to ${data.name}, here are a few tips to help you feel comfortable and prepared. First, consider arriving ten to fifteen minutes early. This gives you time to find parking, locate the sanctuary, and meet a few friendly faces before the service begins.`,
    `Dress codes vary by congregation, but most visitors find that modest, respectful attire is appropriate. When in doubt, business casual is a safe choice. If you have children, ask about nursery care, Sunday school, or youth programs when you arrive.`,
    `During the service, feel free to participate at your own pace. If you are unfamiliar with the customs, observe those around you or ask a greeter for guidance. Many congregations offer printed programs or projected information to help visitors follow along.`,
    `After the service, consider staying for a few minutes of fellowship. This is often the best way to meet members of the congregation, ask questions, and learn more about upcoming events and opportunities to get involved.`,

    `## Community Events & Activities`,
    `${data.name} is more than a place for weekly worship. Like many congregations, it likely hosts a variety of events and activities throughout the year. These may include holiday celebrations, educational classes, social gatherings, service projects, and outreach initiatives.`,
    `Community events provide opportunities to connect with others, learn new skills, and serve the broader ${data.city} area. Whether you are interested in joining a small group, volunteering for a local cause, or simply attending a special service, there are many ways to participate.`,
    `To stay informed about upcoming events, check the congregation's announcements during services, visit ${website}, or contact the office directly. Many congregations also maintain social media pages where they share updates, photos, and invitations to special gatherings.`,

    `## Contact Information`,
    `For the most accurate and up-to-date information, reach out to ${data.name} directly. You can contact them by phone at ${phone}, by email at ${email}, or by visiting ${website}.`,
    `The staff and volunteers are usually happy to answer questions about service times, programs, accessibility, and opportunities to get involved. Whether you are planning your first visit or looking for a long-term spiritual home, they will be glad to hear from you.`,

    `## Plan Your Visit`,
    `${data.name} invites you to come as you are and experience the warmth of its community. With accessible facilities, welcoming members, and a commitment to faith and service, it is a meaningful place to worship, learn, and connect in ${data.city}, ${data.state}.`,
  ];

  return sections.filter(Boolean).join('\n\n');
}
