export async function GET() {
    const apiUrl = "http://localhost:8080/education/api/timetable/subjects";

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            return new Response(JSON.stringify({ error: "Failed to fetch data" }), { status: response.status });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Network error" }), { status: 500 });
    }
}
