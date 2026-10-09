describe('API endpoints',()=>{
  test('GET /health should return 200',()=>{
    const res = request(app).get('/health')
    expect(res.statusCode).toBe(200)
  })
})