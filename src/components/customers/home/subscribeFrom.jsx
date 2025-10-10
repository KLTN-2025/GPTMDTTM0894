export default function EmailSubscribe() {
  return (
    <section className="py-5">
      <div className="container text-center">
        <h4 className="mb-3 fw-bold">Đăng ký nhận thông tin khuyến mãi</h4>
        <p className="mb-4 text-muted">
          Nhận các bản tin mới nhất từ AppleStore ngay trong hộp thư của bạn!
        </p>

        <form className="row justify-content-center" /* onSubmit={handleSubmit} */>
          <div className="col-12 col-md-6">
            <div className="input-group">
              <input
                type="email"
                className="form-control rounded-start-pill"
                placeholder="Nhập email của bạn"
                required
              />
              <button
                className="btn btn-dark rounded-end-pill px-4"
                type="submit"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
