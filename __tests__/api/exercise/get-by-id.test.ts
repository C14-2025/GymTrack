
import { GET } from "@/app/api/exercises/[id]/route"
import { ExerciseModel } from "@/lib/models/Exercise"

import { NextRequest } from "next/server" 

jest.mock("@/lib/models/Exercise", () => ({
  ExerciseModel: {
    findById: jest.fn(),
  },
}))

describe("GET /api/exercises/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })


  const mockRequest = (id: string) => {
    return new NextRequest(`http://localhost/api/exercises/${id}`)
  }

  it("retorna exercício válido (200)", async () => {
    // Arrange
    const id = "1"
    ;(ExerciseModel.findById as jest.Mock).mockReturnValue({
      id: 1,
      name: "Agachamento",
    })

    const response = await GET(mockRequest(id), { params: { id: id } }) 
    const data = await response.json()


    expect(response.status).toBe(200)
    expect(data.name).toBe("Agachamento")
    expect(ExerciseModel.findById).toHaveBeenCalledWith(parseInt(id))
  })

  it("retorna erro para ID inválido (400)", async () => {

    const id = "abc"

    const response = await GET(mockRequest(id), { params: { id: id } })
    const data = await response.json()


    expect(response.status).toBe(400)
    expect(data.error).toBe("ID inválido") 
  })
})
