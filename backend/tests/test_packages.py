def test_list_packages_only_returns_active(client, db, sample_package):
    from app.models.enums import BillingInterval
    from app.models.package import Package

    inactive = Package(
        slug=f"inactive-{sample_package.id}",
        name="Inactive Package",
        description="hidden",
        price_cents=1000,
        currency="gbp",
        billing_interval=BillingInterval.MONTHLY,
        features=[],
        is_active=False,
    )
    db.add(inactive)
    db.commit()

    response = client.get("/api/packages")
    assert response.status_code == 200
    slugs = [p["slug"] for p in response.json()]
    assert sample_package.slug in slugs
    assert inactive.slug not in slugs


def test_get_package_by_slug(client, sample_package):
    response = client.get(f"/api/packages/{sample_package.slug}")
    assert response.status_code == 200
    assert response.json()["name"] == "Fat Loss"


def test_get_missing_package_404s(client):
    response = client.get("/api/packages/does-not-exist")
    assert response.status_code == 404
