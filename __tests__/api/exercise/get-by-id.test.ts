// import { GET } from "@/app/api/exercises/[id]/route"
// import { ExerciseModel } from "@/lib/models/Exercise"

// jest.mock("@/lib/models/Exercise", () => ({
//   ExerciseModel: {
//     findById: jest.fn(),
//   },
// }))

// describe("GET /api/exercises/:id", () => {
//   beforeEach(() => {
//     jest.clearAllMocks()
//   })

//   it("retorna exercício válido", async () => {
//     ;(ExerciseModel.findById as jest.Mock).mockReturnValue({
//       id: 1,
//       name: "Agachamento",
//     })

//     const response = await GET({} as any, { params: { id: "1" } })
//     const data = await response.json()

//     expect(response.status).toBe(200)
//     expect(data.name).toBe("Agachamento")
//   })

//   it("retorna erro para ID inválido", async () => {
//     const response = await GET({} as any, { params: { id: "abc" } })
//     const data = await response.json()

//     expect(response.status).toBe(400)
//     expect(data.error).toBe("ID inválido")
//   })
// })
